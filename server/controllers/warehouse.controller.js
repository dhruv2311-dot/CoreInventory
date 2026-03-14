import { supabase } from '../config/supabase.js';

export const getAllWarehouses = async (req, res) => {
  try {
    const { data, error } = await supabase.from('warehouses').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const { name, code, address } = req.body;
    const { data, error } = await supabase
      .from('warehouses')
      .insert([{ name, code, address }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
