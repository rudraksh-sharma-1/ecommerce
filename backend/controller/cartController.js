// controllers/cartController.js
import {supabase} from "../config/supabaseClient.js";

export const getCartItems = async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, quantity, added_at, products(*)")
    .eq("user_id", user_id);

  if (error) return res.status(500).json({ success: false, error: error.message });

  const cartItems = data.map((item) => ({
    ...item.products,
    cart_item_id: item.id,
    quantity: item.quantity,
    added_at: item.added_at,
  }));

  return res.json({ success: true, cartItems });
};

export const addToCart = async (req, res) => {
  const { user_id, product_id, quantity = 1 } = req.body;

  const { data: existing, error: findError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .single();

  if (findError && findError.code !== "PGRST116")
    return res.status(500).json({ success: false, error: findError.message });

  if (existing) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, cartItem: data });
  } else {
    const { data, error } = await supabase
      .from("cart_items")
      .insert([{ user_id, product_id, quantity }])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, cartItem: data });
  }
};

export const updateCartItem = async (req, res) => {
  const { cart_item_id } = req.params;
  const { quantity } = req.body;

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cart_item_id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, cartItem: data });
};

export const removeCartItem = async (req, res) => {
  const { cart_item_id } = req.params;

  const { error } = await supabase.from("cart_items").delete().eq("id", cart_item_id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true });
};

export const clearCart = async (req, res) => {
  const { user_id } = req.params;

  const { error } = await supabase.from("cart_items").delete().eq("user_id", user_id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true });
};
