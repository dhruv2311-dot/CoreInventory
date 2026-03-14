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
    products (name, sku),
    from_loc:from_location (name),
    to_loc:to_location (name)
  `).order('date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const transferStock = async (req, res) => {
  try {
    const { product_id, from_location, to_location, quantity } = req.body;
    
    if (!product_id || !from_location || !to_location || !quantity) {
      return res.status(400).json({ message: 'Missing required transfer fields' });
    }

    if (from_location === to_location) {
      return res.status(400).json({ message: 'Source and target location cannot be the same' });
    }

    // 1. Validate Source Location has enough stock
    const { data: sourceStock } = await supabase
      .from('stock')
      .select('id, quantity')
      .eq('product_id', product_id)
      .eq('location_id', from_location)
      .single();

    if (!sourceStock || sourceStock.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock in source location' });
    }

    // 2. Reduce from source
    await supabase.from('stock').update({ quantity: sourceStock.quantity - quantity }).eq('id', sourceStock.id);

    // 3. Add to target location
    const { data: targetStock } = await supabase
      .from('stock')
      .select('id, quantity')
      .eq('product_id', product_id)
      .eq('location_id', to_location)
      .maybeSingle();

    if (targetStock) {
      await supabase.from('stock').update({ quantity: targetStock.quantity + quantity }).eq('id', targetStock.id);
    } else {
      await supabase.from('stock').insert([{ product_id, location_id: to_location, quantity }]);
    }

    // 4. Log the internal move
    await supabase.from('stock_moves').insert([{
      product_id,
      from_location,
      to_location,
      quantity,
      type: 'Internal Transfer',
      date: new Date().toISOString()
    }]);

    res.status(200).json({ message: 'Internal Transfer completed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
