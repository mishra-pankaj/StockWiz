import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getStock, analyzeStock } from "../controllers/stockController.js";

const router = express.Router();

router.get("/stock/:symbol", authenticateToken, getStock);
router.get("/analyze/:symbol", authenticateToken, analyzeStock);

export default router;

