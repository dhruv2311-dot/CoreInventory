import { supabase } from '../config/supabase.js';

export const getProducts = async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createProduct = async (req, res) => {
  const { name, sku, category, unit, price } = req.body;
  const { data, error } = await supabase.from('products').insert([{ name, sku, category, unit, price }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, sku, category, unit, price } = req.body;
  const { data, error } = await supabase.from('products').update({ name, sku, category, unit, price }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data[0]);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
