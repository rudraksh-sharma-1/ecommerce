// routes/orderItemRoutes.js
import express from "express";
import {
  getAllOrderItems,
  getOrderItemsByOrderId,
  getOrderItemsByProductId,
  deleteOrderItemsByOrderId,
} from "../controller/orderItemsController.js";

const router = express.Router();

router.get("/", getAllOrderItems);
router.get("/order/:order_id", getOrderItemsByOrderId);
router.get("/product/:product_id", getOrderItemsByProductId);
router.delete("/order/:order_id", deleteOrderItemsByOrderId);

export default router;
