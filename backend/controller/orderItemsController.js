// controllers/orderItemController.js
import {supabase} from "../config/supabaseClient.js";

// Get all order items (admin access or for analytics)
export const getAllOrderItems = async (req, res) => {
  const { data, error } = await supabase
    .from("order_items")
    .select("*, products(*)");

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, orderItems: data });
};

// Get order items by order_id (specific to one order)
export const getOrderItemsByOrderId = async (req, res) => {
  const { order_id } = req.params;

  const { data, error } = await supabase
    .from("order_items")
    .select("*, products(*)")
    .eq("order_id", order_id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, items: data });
};

// Get order items for a specific product (analytics/reporting)
export const getOrderItemsByProductId = async (req, res) => {
  const { product_id } = req.params;

  const { data, error } = await supabase
    .from("order_items")
    .select("*, orders(user_id, created_at)")
    .eq("product_id", product_id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, items: data });
};

// Delete all order items for an order (for rollback or admin usage)
export const deleteOrderItemsByOrderId = async (req, res) => {
  const { order_id } = req.params;

  const { error } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", order_id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, message: "Order items deleted successfully" });
};
