import axios from "axios";
import { supabase } from "../config/supabaseClient.js"; // Adjust path as needed

export const getCoordinatesByPincode = async (req, res) => {
  try {
    const { pincode, country = "India" } = req.query;

    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      return res.status(400).json({ error: "Invalid pincode provided" });
    }

    // 1. Try to find coordinates in pincode_locations cache
    const { data: cached, error: cacheError } = await supabase
      .from("pincode_locations")
      .select("latitude, longitude")
      .eq("pincode", pincode)
      .single();

    if (cached) {
      return res.status(200).json({
        lat: cached.latitude,
        lng: cached.longitude,
        fromCache: true,
      });
    }

    // 2. If not cached, fetch from OpenStreetMap Nominatim API
    const query = `${pincode}, ${country}`;
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: query,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "yourapp/1.0 (your@email.com)",
      },
    });

    const location = response.data?.[0];

    if (!location) {
      return res.status(404).json({ error: "Could not find location for this pincode" });
    }

    const latitude = location.lat;
    const longitude = location.lon;

    // 3. Save to Supabase cache
    await supabase
      .from("pincode_locations")
      .insert([{ pincode, latitude, longitude }]);

    res.status(200).json({
      lat: latitude,
      lng: longitude,
      fromCache: false,
    });
  } catch (err) {
    console.error("Error fetching coordinates:", err.message);
    res.status(500).json({ error: "Server error while getting coordinates" });
  }
};
