const Session = require("../models/session.model.js");

// Create a session
exports.createSession = async (req, res) => {
  try {
    const {
      name,
      subject,
      location,
      day,
      startTime,
      endTime,
      admin,
      students,
    } = req.body;

    const session = new Session({
      name,
      subject,
      location,
      day,
      startTime,
      endTime,
      admin,
      students,
    });

    await session.save();
    res.status(201).json(session);
  } catch (err) {
    //.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
};

// Get all sessions
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("admin", "name email")
      .populate("students", "name email");
    res.json(sessions);
  } catch (err) {
    //.error(err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// Get single session
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("admin", "name email")
      .populate("students", "name email");
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    //.error(err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

// Update session
exports.updateSession = async (req, res) => {
  try {
    const updateData = req.body;
    const session = await Session.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("admin", "name email")
      .populate("students", "name email");
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    //.error(err);
    res.status(500).json({ error: "Failed to update session" });
  }
};

// Delete session
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    //.error(err);
    res.status(500).json({ error: "Failed to delete session" });
  }
};
