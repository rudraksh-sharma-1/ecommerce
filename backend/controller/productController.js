import {supabase} from "../config/supabaseClient.js";

export const getAllProducts = async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price'); // add more fields if needed

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};
