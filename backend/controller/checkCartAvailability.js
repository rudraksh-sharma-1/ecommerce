// controllers/checkCartAvailability.js
import { supabase } from "../config/supabaseClient.js";

export const checkCartAvailability = async (req, res) => {
  try {
    const { items, latitude, longitude } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !latitude || !longitude) {
      return res.status(400).json({ success: false, error: "Items, latitude, and longitude are required." });
    }

    // Call your Postgres RPC function
    const { data: nearbyProducts, error } = await supabase.rpc("get_products_within_15km", {
      user_lat: latitude,
      user_lon: longitude,
    });
    /* console.log("available products:", nearbyProducts) */

    if (error) {
      console.error("Supabase RPC Error:", error.message);
      return res.status(500).json({ success: false, error: "Server error during delivery check." });
    }

    const availableProductIds = nearbyProducts.map((p) => p.product_id);

    const undeliverableProducts = items
      .filter((item) => !availableProductIds.includes(item.product_id))
      .map((item) => item.product_id);

    const isAllDeliverable = undeliverableProducts.length === 0;

    return res.status(200).json({
      success: true,
      deliverable: isAllDeliverable,
      undeliverable_products: undeliverableProducts,
    });
  } catch (err) {
    console.error("Delivery check failed:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
