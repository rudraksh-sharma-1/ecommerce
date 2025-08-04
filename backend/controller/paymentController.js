// controllers/paymentController.js
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, error: "Valid amount is required" });
        }

        const options = {
            amount: amount * 100, // convert to paisa
            currency: "INR",
            receipt: `receipt_${Math.floor(Math.random() * 1000000)}`,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);

        return res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error("Razorpay error:", error);
        return res.status(500).json({ success: false, error: "Razorpay order creation failed" });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (generatedSignature === razorpay_signature) {
        return res.json({ success: true, message: "Payment verified" });
    } else {
        return res.status(400).json({ success: false, error: "Invalid signature" });
    }
};

export const verifyRazorpaySignature = (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        return res.json({ success: true, message: "Payment signature verified" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }
};