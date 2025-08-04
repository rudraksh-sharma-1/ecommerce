// routes/cartValidationRoutes.js (or add to your existing routes file)
import express from "express";
import { checkCartAvailability } from "../controller/checkCartAvailability.js";

const router = express.Router();

router.post("/check-cart-availability", checkCartAvailability);

export default router;
