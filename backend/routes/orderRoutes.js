import express from "express";
import {
  getAllOrders,
  placeOrder,
  placeOrderWithDetailedAddress,
  getUserOrders,
  updateOrderStatus,
  deleteOrderById,
} from "../controller/orderController.js";

const router = express.Router();

router.get("/all", getAllOrders);
router.post("/place", placeOrder);
router.post("/place-detailed", placeOrderWithDetailedAddress);
router.get("/user/:user_id", getUserOrders);
router.put("/status/:id", updateOrderStatus);
router.delete("/delete/:id", deleteOrderById);

export default router;