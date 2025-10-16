import express from "express";
import jwt from "jsonwebtoken";
import Thought from "../models/thought.js";

const router = express.Router();

// Middleware: verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// GET all thoughts
router.get("/", async (req, res) => {
  try {
    const thoughts = await Thought.find().sort({ createdAt: -1 });
    res.json(thoughts);
  } catch (error) {
    console.error("Error fetching thoughts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new thought
router.post("/", verifyToken, async (req, res) => {
  console.log("POST /api/thoughts reached");
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const newThought = new Thought({
      userId: req.user.id,
      content,
    });

    await newThought.save();
    res.status(201).json({ message: "Thought shared successfully!" });
  } catch (error) {
    console.error("Error creating thought:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
