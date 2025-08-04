import axios from "axios";
import { supabase } from "../config/supabaseClient.js";

export const createGeoAddress = async (req, res) => {
  try {
    const {
      user_id,
      address_name,
      is_default = false,
      street_address,
      suite_unit_floor,
      house_number,
      locality,
      area,
      city,
      state,
      postal_code,
      country,
      landmark,
    } = req.body;

    // Check for existing pincode location
    let { data: pincodeData, error: pincodeError } = await supabase
      .from("pincode_locations")
      .select("*")
      .eq("pincode", postal_code)
      .single();

    let latitude, longitude;

    // If not found, call Google API and insert
    if (!pincodeData) {
      // 2. Fetch from OpenStreetMap (Nominatim)
      const fullAddress = `${postal_code}, ${country}`;
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: fullAddress,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "yourapp/1.0 (your@email.com)",
          },
        }
      );

      const location = response.data?.[0];

      if (!location) {
        return res
          .status(400)
          .json({ error: "Could not get coordinates for this pincode" });
      }

      latitude = location.lat;
      longitude = location.lon;

      // Insert into pincode_locations
      await supabase
        .from("pincode_locations")
        .insert([{ pincode: postal_code, latitude, longitude }]);
    } else {
      latitude = pincodeData.latitude;
      longitude = pincodeData.longitude;
    }

    // Prevent duplicate address_name for same user
    const { data: existingAddress, error: existingError } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", user_id)
      .eq("address_name", address_name)
      .maybeSingle();

    if (existingAddress) {
      return res.status(400).json({
        error: "An address with this name already exists for the user.",
      });
    }

    if (is_default) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user_id);
    }
    // Insert full address with lat/lng
    const { data: addressData, error: addressError } = await supabase
      .from("user_addresses")
      .insert([
        {
          user_id,
          address_name,
          is_default,
          street_address,
          suite_unit_floor,
          house_number,
          locality,
          area,
          city,
          state,
          postal_code,
          country,
          landmark,
          latitude,
          longitude,
        },
      ])
      .select()
      .single();

    if (addressError) {
      return res.status(500).json({ error: addressError.message });
    }

    res
      .status(201)
      .json({ message: "Address created successfully", data: addressData });
  } catch (err) {
    console.error("Geo address error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateGeoAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      address_name,
      is_default = false,
      street_address,
      suite_unit_floor,
      house_number,
      locality,
      area,
      city,
      state,
      postal_code,
      country,
      landmark,
    } = req.body;

    // Check pincode location
    let { data: pincodeData } = await supabase
      .from("pincode_locations")
      .select("*")
      .eq("pincode", postal_code)
      .single();

    let latitude, longitude;

    if (!pincodeData) {
      const fullAddress = `${postal_code}, ${country}`;
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: fullAddress,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "yourapp/1.0 (your@email.com)",
          },
        }
      );

      const location = response.data?.[0];
      if (!location) {
        return res
          .status(400)
          .json({ error: "Could not get coordinates for this pincode" });
      }

      latitude = location.lat;
      longitude = location.lon;

      await supabase
        .from("pincode_locations")
        .insert([{ pincode: postal_code, latitude, longitude }]);
    } else {
      latitude = pincodeData.latitude;
      longitude = pincodeData.longitude;
    }

    // Before inserting new address, reset all others to is_default = false
    /* if (is_default) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user_id)
        .neq("id", id); // don't reset the one we're updating
    } */
    const { data, error } = await supabase
      .from("user_addresses")
      .update({
        address_name,
        is_default,
        street_address,
        suite_unit_floor,
        house_number,
        locality,
        area,
        city,
        state,
        postal_code,
        country,
        landmark,
        latitude,
        longitude,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Address updated successfully", data });
  } catch (err) {
    console.error("Update address error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("user_addresses").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "Address deleted successfully" });
};
