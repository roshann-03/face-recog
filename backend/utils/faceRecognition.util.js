const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");
const tf = require("@tensorflow/tfjs-node"); // must import this first
const { Canvas, Image, ImageData } = canvas;

// Patch node canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load face detection & recognition models
const MODEL_PATH = path.join(__dirname, "../models/face");
const loadModels = async () => {
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
    //.log("Face models loaded");
  } catch (err) {
    //.error("Error loading models:", err);
  }
};

// Extract face embeddings from a base64 image or buffer
const getFaceEmbedding = async (imageInput) => {
  let img;
  try {
    if (Buffer.isBuffer(imageInput)) {
      img = await canvas.loadImage(imageInput);
    } else if (
      typeof imageInput === "string" &&
      imageInput.startsWith("data:image")
    ) {
      const buffer = Buffer.from(
        imageInput.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      img = await canvas.loadImage(buffer);
    } else {
      throw new Error("Unsupported image format");
    }
  } catch (err) {
    //.error("Failed to load image:", err.message);
    return [];
  }

  try {
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections || detections.length === 0) return [];
    // Return array of embeddings (one per face)
    return detections.map((d) => Array.from(d.descriptor));
  } catch (err) {
    //.error("Failed to detect faces:", err.message);
    return [];
  }
};

// Compare a live embedding with a stored student embedding
const compareEmbeddings = (embedding1, embedding2, threshold = 0.6) => {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length)
    return false;
  const distance = Math.sqrt(
    embedding1.reduce(
      (sum, val, i) => sum + Math.pow(val - embedding2[i], 2),
      0
    )
  );
  return distance < threshold;
};

module.exports = { loadModels, getFaceEmbedding, compareEmbeddings };
