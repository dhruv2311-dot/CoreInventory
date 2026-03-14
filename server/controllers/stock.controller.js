import { supabase } from '../config/supabase.js';

export const getStock = async (req, res) => {
  const { data, error } = await supabase.from('stock').select(`
    *,
    products (name, sku, price, unit)
  `);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const updateStock = async (req, res) => {
  const { product_id, quantity, reason } = req.body;
  // This is used for adjustments or forced updates
  
  const { data: existingStock } = await supabase
    .from('stock')
    .select('*')
    .eq('product_id', product_id)
    .limit(1)
    .single();
    
  let newQty = quantity;
  let moveQty = quantity;
  
  if (existingStock) {
    newQty = quantity;
    moveQty = quantity - existingStock.quantity;
    
    await supabase
      .from('stock')
      .update({ quantity: newQty < 0 ? 0 : newQty })
      .eq('id', existingStock.id);
  } else {
    await supabase
      .from('stock')
      .insert([{ product_id, quantity }]);
  }
  
  if (moveQty !== 0) {
    // Log adjustment in movement history
    await supabase.from('stock_moves').insert([{
      product_id,
      quantity: Math.abs(moveQty),
      type: moveQty > 0 ? 'Adjustment (In)' : 'Adjustment (Out)',
      date: new Date().toISOString()
    }]);
  }
  
  res.status(200).json({ message: 'Stock updated', newQty });
};

export const getStockMoves = async (req, res) => {
  const { data, error } = await supabase.from('stock_moves').select(`
    *,
    products (name, sku)
  `).order('date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};
