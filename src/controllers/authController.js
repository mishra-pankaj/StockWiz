import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function signup(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ email, passwordHash });
    await newUser.save();

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Server error during signup.",
      error: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const tokenPayload = { userId: user._id, email: user.email };
    const secretKey =
      process.env.JWT_SECRET || "a-very-strong-default-secret-key";
    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "1h" });

    res.json({ message: "Login successful.", token, userEmail: user.email });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error during login.",
      error: error.message,
    });
  }
}

