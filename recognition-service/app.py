from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import base64
import cv2
from pymongo import MongoClient
import bcrypt
import jwt
import datetime
from functools import wraps
from bson import ObjectId

from datetime import datetime, timezone, timedelta

today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
today_end = today_start + timedelta(days=1)


app = Flask(__name__)
CORS(app)

# MongoDB setup
MONGO_URI = "mongodb://127.0.0.1:27017"
client = MongoClient(MONGO_URI)
db = client["face-recog"]
students_collection = db["users"]
attendance_collection = db["attendance"]

SECRET_KEY = "5a1d13c682e3208a793a4daa77a7e7646dab406d3aa4a9aa2cf5f8e2b7d36321"

# Auth decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token missing"}), 403
        try:
            token = token.replace("Bearer ", "")
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = students_collection.find_one({"_id": ObjectId(decoded["id"])})
            if not user:
                return jsonify({"error": "User not found"}), 403
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 403
        return f(user, *args, **kwargs)
    return decorated

# Load student encodings
def load_student_encodings():
    students = list(students_collection.find({"role": "student"}))
    encodings = []
    for s in students:
        if s.get("faceEncoding"):
            encodings.append({
                "id": s["_id"],
                "name": s["name"],
                "encoding": np.array(s["faceEncoding"], dtype=np.float32)
            })
    return encodings

# Scan and mark attendance
@app.route("/attendance/scan", methods=["POST"])
@token_required
def recognize_face(current_user):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        image_b64 = data.get("image")
        if not image_b64:
            return jsonify({"error": "No image provided"}), 400

        if "," in image_b64:
            image_data = base64.b64decode(image_b64.split(",")[1])
        else:
            image_data = base64.b64decode(image_b64)
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Important for face_recognition

        face_locations = face_recognition.face_locations(rgb_img)
        face_encodings = face_recognition.face_encodings(rgb_img, face_locations)

        if not face_encodings:
            return jsonify({"students": [], "image": image_b64, "message": "No face detected"}), 200

        # Load student encodings
        student_encodings = load_student_encodings()
        # Convert all encodings to float32 for consistency
        for s in student_encodings:
            s["encoding"] = np.array(s["encoding"], dtype=np.float32)

        recognized_students = []
        marked_students = []

        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            face_encoding = np.array(face_encoding, dtype=np.float32)
            matched_student = None
            for student in student_encodings:
                if face_recognition.compare_faces([student["encoding"]], face_encoding, tolerance=0.6)[0]:
                    matched_student = students_collection.find_one({"_id": ObjectId(student["id"])})
                    recognized_students.append({
                        "name": matched_student["name"],
                        "enrollmentNumber": matched_student.get("enrollmentNumber"),
                        "course": matched_student.get("course"),
                        "semester": matched_student.get("semester")
                    })
                    break

            if matched_student:
                existing = attendance_collection.find_one({
                    "student": matched_student["_id"],
                    "date": {"$gte": today_start, "$lt": today_end}
                })
                if not existing:
                    #t("Marking attendance for:", matched_student["_id"], matched_student["name"])
                    attendance_collection.insert_one({
                        "student": matched_student["_id"],
                        "date": datetime.now(timezone.utc),
                        "status": "present",
                        "recognizedBy": current_user["_id"]
                    })

                    marked_students.append(matched_student["name"])

            name = matched_student["name"] if matched_student else "Unknown"
            cv2.rectangle(img, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(img, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        _, buffer = cv2.imencode('.jpg', img)
        img_base64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
        message = f"✅ Attendance registered for: {', '.join(marked_students)}" if marked_students else "ℹ️ No new attendance marked"

        return jsonify({"students": recognized_students, "image": img_base64, "message": message})

    except Exception as e:
        return jsonify({"error": str(e)}), 500




# Create/Edit student
@app.route("/students", methods=["POST"])
@app.route("/students/<student_id>", methods=["PUT"])
@token_required
def create_or_edit_student(current_user, student_id=None):
    try:
        if current_user["role"] != "admin":
            return jsonify({"error": "Unauthorized"}), 403

        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        enrollment_number = data.get("enrollmentNumber")
        course = data.get("course")
        semester = data.get("semester")
        image_b64 = data.get("image") or data.get("faceEncoding")

        required_fields = [name, email, enrollment_number, course, semester]
        if not all(required_fields):
            return jsonify({"error": "All fields required"}), 400

        if student_id:
            student = students_collection.find_one({"_id": ObjectId(student_id)})
            if not student:
                return jsonify({"error": "Student not found"}), 404
        else:
            if students_collection.find_one({"email": email}):
                return jsonify({"error": "Email already exists"}), 400

        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()) if password else None

        face_encoding = None
        if image_b64:
            if "," in image_b64:
                image_data = base64.b64decode(image_b64.split(",")[1])
            else:
                image_data = base64.b64decode(image_b64)
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            encodings = face_recognition.face_encodings(img)
            if not encodings:
                return jsonify({"error": "No face detected"}), 400
            face_encoding = encodings[0].tolist()

        student_data = {
            "name": name,
            "email": email,
            "role": "student",
            "enrollmentNumber": enrollment_number,
            "course": course,
            "semester": semester,
        }
        if hashed_password:
            student_data["password"] = hashed_password
        if face_encoding:
            student_data["faceEncoding"] = face_encoding

        if student_id:
            students_collection.update_one({"_id": ObjectId(student_id)}, {"$set": student_data})
            return jsonify({"message": "Student updated successfully"})
        else:
            students_collection.insert_one(student_data)
            return jsonify({"message": "Student created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Login
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        user = students_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if bcrypt.checkpw(password.encode(), user["password"]):
            token = jwt.encode({"id": str(user["_id"]), "exp": datetime.now(timezone.utc) ++ timedelta(hours=2)}, SECRET_KEY, algorithm="HS256")
            return jsonify({"token": token})
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetch all students (for frontend)
@app.route("/students", methods=["GET"])
@token_required
def get_students(current_user):
    students = list(students_collection.find({"role": "student"}))
    for s in students:
        s["_id"] = str(s["_id"])
    return jsonify(students)

# Fetch all admins (for frontend)
@app.route("/admins", methods=["GET"])
@token_required
def get_admins(current_user):
    admins = list(students_collection.find({"role": "admin"}))
    for a in admins:
        a["_id"] = str(a["_id"])
    return jsonify(admins)

# Delete admin
@app.route("/admins/<admin_id>", methods=["DELETE"])
@token_required
def delete_admin(current_user, admin_id):
    if current_user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    students_collection.delete_one({"_id": ObjectId(admin_id)})
    return jsonify({"message": "Admin deleted successfully"})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
