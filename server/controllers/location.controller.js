import { supabase } from '../config/supabase.js';

export const getAllLocations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*, warehouses(name)');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { name, short_code, warehouse_id } = req.body;
    const { data, error } = await supabase
      .from('locations')
      .insert([{ name, short_code, warehouse_id }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
