# Face Recognition Attendance System

This is a Flask-based face recognition attendance system with admin panel, multi-face recognition, Excel export, and camera support (webcam or IP/URL).

## Features

- Admin login with hashed passwords
- Add students with image, name, roll number, semester, and course
- Store face encodings in SQLite
- Scan multiple faces at once from webcam or IP/URL camera
- Attendance logging in SQLite and Excel files (organized by date, semester, and course)
- Export attendance Excel files per course/day
- Minimal, modern web interface

## Requirements

- Python 3.10+
- Flask
- OpenCV
- face_recognition
- dlib
- pandas
- werkzeug

Install requirements:

```bash
pip install flask opencv-python face_recognition dlib pandas werkzeug
