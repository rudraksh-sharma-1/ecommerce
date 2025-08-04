// controllers/orderController.js
import { supabase } from "../config/supabaseClient.js";

/** Get all orders (admin usage) */
export const getAllOrders = async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, users(name, email, phone)")  // 👈 join users table
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, orders: data });
};

/** Update an order’s status */
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminnotes = "" } = req.body;

  const { error } = await supabase
    .from("orders")
    .update({ status, adminnotes })
    .eq("id", id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true });
};

/** Get orders for a specific user */
export const getUserOrders = async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*))")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, orders: data });
};

/** Place order with a flat address string */
export const placeOrder = async (req, res) => {
  const { user_id, items, subtotal, shipping, total, address, payment_method } = req.body;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([{ user_id, subtotal, shipping, total, address, payment_method }])
    .select()
    .single();

  if (orderError) return res.status(500).json({ success: false, error: orderError.message });

  const orderItemsToInsert = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsToInsert);

  if (itemsError) return res.status(500).json({ success: false, error: itemsError.message });

  // Optional: clear user's cart (no response check here)
  await supabase.from("cart_items").delete().eq("user_id", user_id);

  return res.json({ success: true, order });
};

/** Place order with detailed structured address */
export const placeOrderWithDetailedAddress = async (req, res) => {
  const {
    user_id,
    items,
    subtotal,
    shipping,
    total,
    detailedAddress,
    payment_method,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  /* console.log("Order Inserting With:", {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }); */


  const addressString = [
    detailedAddress.houseNumber && detailedAddress.streetAddress
      ? `${detailedAddress.houseNumber} ${detailedAddress.streetAddress}`
      : detailedAddress.streetAddress,
    detailedAddress.suiteUnitFloor,
    detailedAddress.locality,
    detailedAddress.area,
    detailedAddress.city,
    detailedAddress.state,
    detailedAddress.postalCode,
    detailedAddress.country || "India",
    detailedAddress.landmark ? `Near ${detailedAddress.landmark}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const orderData = {
    user_id,
    subtotal,
    shipping,
    total,
    address: addressString,
    payment_method,
    shipping_house_number: detailedAddress.houseNumber,
    shipping_street_address: detailedAddress.streetAddress,
    shipping_suite_unit_floor: detailedAddress.suiteUnitFloor,
    shipping_locality: detailedAddress.locality,
    shipping_area: detailedAddress.area,
    shipping_city: detailedAddress.city,
    shipping_state: detailedAddress.state,
    shipping_postal_code: detailedAddress.postalCode,
    shipping_country: detailedAddress.country || "India",
    shipping_landmark: detailedAddress.landmark,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (orderError) return res.status(500).json({ success: false, error: orderError.message });

  const orderItemsToInsert = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id || item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsToInsert);

  if (itemsError) return res.status(500).json({ success: false, error: itemsError.message });

  await supabase.from("cart_items").delete().eq("user_id", user_id);

  return res.json({ success: true, order });
};

export const deleteOrderById = async (req, res) => {
  const { id } = req.params;

  // Step 1: Delete all order items for this order
  const { error: itemError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", id);

  if (itemError) {
    return res.status(500).json({ success: false, error: itemError.message });
  }

  // Step 2: Delete the order
  const { error: orderError } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (orderError) {
    return res.status(500).json({ success: false, error: orderError.message });
  }

  return res.json({ success: true, message: "Order and its items deleted successfully." });
};

