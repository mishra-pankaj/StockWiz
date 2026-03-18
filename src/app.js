import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure env vars are loaded before using GEMINI_API_KEY
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
app.locals.geminiModel = geminiModel;

app.use("/", viewRoutes);
app.use("/auth", authRoutes);
app.use("/", stockRoutes);

export default app;

