import {supabase} from '../config/supabaseClient.js'
import axios from 'axios';

// POST /api/warehouses - Create warehouse
export const createWarehouse = async (req, res) => {
  try {
    const { name, pincode, address } = req.body;
    console.log("Received data:", req.body);

    if (!name || !pincode || !address) {
      return res.status(400).json({ error: 'Name, pincode, and address are required' });
    }

    const {data: existingWarehouse, error: existingError}= await supabase
    .from('warehouses')
    .select('*')
    .eq("name", name)
    .single()

    if(existingWarehouse){
        return res
        .status(400)
        .json({
          error: "A Warehouse with this name already exists.",
        });
    }

    
    // Step 1: Try to get lat/lng from pincode_locations
    let { data: pincodeData } = await supabase
      .from('pincode_locations')
      .select('*')
      .eq('pincode', pincode)
      .single();

    let latitude, longitude;

    if (!pincodeData) {
      // Step 2: Fetch coordinates from OpenStreetMap (Nominatim)
      const fullAddress = `${pincode}, ${address}`;
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: { q: fullAddress, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'yourapp/1.0 (admin@yourdomain.com)' },
        }
      );

      const location = response.data?.[0];
      if (!location) {
        return res.status(400).json({ error: 'Could not fetch coordinates for this pincode.' });
      }

      latitude = parseFloat(location.lat);
      longitude = parseFloat(location.lon);

      // Insert into pincode_locations
      await supabase.from('pincode_locations').insert([{ pincode, latitude, longitude }]);
    } else {
      latitude = pincodeData.latitude;
      longitude = pincodeData.longitude;
    }

    // Step 3: Insert warehouse
    const { data, error } = await supabase
      .from('warehouses')
      .insert([{ name, pincode, address, latitude, longitude }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Warehouse created with coordinates', data });

  } catch (err) {
    console.error('Warehouse creation error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};



// PUT /api/warehouses/:id - Edit warehouse
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pincode, address } = req.body;

    // Step 1: Fetch current warehouse data
    const { data: existingWarehouse, error: fetchError } = await supabase
      .from('warehouses')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingWarehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    let latitude = existingWarehouse.latitude;
    let longitude = existingWarehouse.longitude;

    // Step 2: If pincode or address changed → recalculate lat/lng
    const pincodeChanged = pincode && pincode !== existingWarehouse.pincode;
    const addressChanged = address && address !== existingWarehouse.address;

    if (pincodeChanged || addressChanged) {
      // Try pincode_locations first
      let { data: pincodeData } = await supabase
        .from('pincode_locations')
        .select('*')
        .eq('pincode', pincode)
        .single();

      if (!pincodeData) {
        // Use OSM to get coordinates
        const fullAddress = `${pincode}, India`;
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: { q: fullAddress, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'yourapp/1.0 (admin@yourdomain.com)' },
          }
        );

        const location = response.data?.[0];
        if (!location) {
          return res.status(400).json({ error: 'Could not fetch coordinates for this pincode.' });
        }

        latitude = parseFloat(location.lat);
        longitude = parseFloat(location.lon);

        // Save to pincode_locations
        await supabase.from('pincode_locations').insert([{ pincode, latitude, longitude }]);
      } else {
        latitude = pincodeData.latitude;
        longitude = pincodeData.longitude;
      }
    }

    // Step 3: Update warehouse with new values
    const { data, error } = await supabase
      .from('warehouses')
      .update({ name, pincode, address, latitude, longitude })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Warehouse updated successfully', data });

  } catch (err) {
    console.error('Warehouse update error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/warehouses/:id - Delete warehouse
export const deleteWarehouse = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('warehouses')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: 'Warehouse deleted' });
};

// GET /api/warehouses - Get all
export const getAllWarehouses = async (req, res) => {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};

export const getSingleWarehouse = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};

