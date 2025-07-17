import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to a warehouse using IDs
export const mapProductToWarehouse = async (req, res) => {
  try {
    const { product_id, warehouse_id } = req.body;

    if (!product_id || !warehouse_id) {
      return res.status(400).json({ error: 'product_id and warehouse_id are required.' });
    }

    // Insert mapping (ignore if duplicate)
    const { error } = await supabase
      .from('product_warehouse')
      .insert([{ product_id, warehouse_id }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Mapping already exists.' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product mapped to warehouse successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2️⃣ Remove product from a warehouse
export const removeProductFromWarehouse = async (req, res) => {
  try {
    const { product_id, warehouse_id } = req.body;

    const { error } = await supabase
      .from('product_warehouse')
      .delete()
      .eq('product_id', product_id)
      .eq('warehouse_id', warehouse_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Mapping removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3️⃣ Get all warehouses stocking a product
export const getWarehousesForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from('product_warehouse')
      .select('warehouse_id, warehouses (id, name, address, pincode)')
      .eq('product_id', product_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4️⃣ Get all products in a warehouse
export const getProductsForWarehouse = async (req, res) => {
  try {
    const { warehouse_id } = req.params;

    const { data, error } = await supabase
      .from('product_warehouse')
      .select('product_id, products (id, name, price, rating, image, category)')
      .eq('warehouse_id', warehouse_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5️⃣ Bulk map products by names and warehouse name
export const bulkMapByNames = async (req, res) => {
  try {
    const { warehouse_name, product_names } = req.body;

    if (!warehouse_name || !product_names || !Array.isArray(product_names)) {
      return res.status(400).json({ error: 'warehouse_name and product_names[] are required.' });
    }

    // 1. Get warehouse ID from name
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id')
      .eq('name', warehouse_name)
      .single();

    if (warehouseError || !warehouseData) {
      return res.status(404).json({ error: 'Warehouse not found.' });
    }

    // 2. Get product IDs from names
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .in('name', product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: 'No matching products found.' });
    }

    // 3. Map each product to warehouse
    const inserts = products.map(p => ({
      product_id: p.id,
      warehouse_id: warehouseData.id
    }));

    const { error: insertError } = await supabase
      .from('product_warehouse')
      .insert(inserts, { upsert: false }); // ignore duplicates

    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to warehouse "${warehouse_name}".`,
      mapped_products: products.map(p => p.name)
    });

  } catch (err) {
    console.error('Bulk map error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

