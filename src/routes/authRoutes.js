// routes/authRoutes.js
import { Router } from "express";
import { checkLoggedIn } from "../middleware/authMiddleware.js";
import { renderLoginPage, loginUser } from "../controllers/authController.js";

const router = Router();

router.get("/", checkLoggedIn, renderLoginPage);
router.get("/login", checkLoggedIn, renderLoginPage);
router.post("/login", loginUser);

export default router;
