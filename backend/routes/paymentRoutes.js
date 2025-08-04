// routes/paymentRoutes.js
import express from "express";
import { createRazorpayOrder, verifyRazorpayPayment, verifyRazorpaySignature  } from "../controller/paymentController.js";

const router = express.Router();

router.post("/create-order", createRazorpayOrder); // POST /api/payment/create-order
router.post("/verify-payment", verifyRazorpayPayment)
router.post("/verify-signature", verifyRazorpaySignature)

export default router;
