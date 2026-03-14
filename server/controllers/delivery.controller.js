import { supabase } from '../config/supabase.js';

export const getDeliveries = async (req, res) => {
  const { data, error } = await supabase.from('deliveries').select(`
    *,
    delivery_items (*, products (name, sku))
  `);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createDelivery = async (req, res) => {
  const { reference, customer, date, items } = req.body;
  // items: [{ product_id, quantity }]
  
  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .insert([{ reference, customer, date, status: 'Draft' }])
    .select()
    .single();
    
  if (deliveryError) return res.status(500).json({ error: deliveryError.message });
  
  if (items && items.length > 0) {
    const deliveryItems = items.map(item => ({
      delivery_id: delivery.id,
      product_id: item.product_id,
      quantity: item.quantity
    }));
    const { error: itemsError } = await supabase.from('delivery_items').insert(deliveryItems);
    if (itemsError) return res.status(500).json({ error: itemsError.message });
  }
  
  res.status(201).json(delivery);
};

export const getDeliveryById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('deliveries')
    .select(`
      *,
      delivery_items (*, products (name, sku))
    `)
    .eq('id', id)
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const validateDelivery = async (req, res) => {
  const { id } = req.params;
  
  // 1. Get delivery items
  const { data: deliveryItems, error: itemsError } = await supabase
    .from('delivery_items')
    .select('*')
    .eq('delivery_id', id);
    
  if (itemsError) return res.status(500).json({ error: itemsError.message });
  
  for (const item of deliveryItems) {
    // subtract stock
    const { data: existingStock } = await supabase
      .from('stock')
      .select('*')
      .eq('product_id', item.product_id)
      .limit(1)
      .single();
      
    if (existingStock) {
      const newQty = existingStock.quantity - item.quantity;
      await supabase
        .from('stock')
        .update({ quantity: newQty < 0 ? 0 : newQty })
        .eq('id', existingStock.id);
    }
    
    // Create stock move
    await supabase.from('stock_moves').insert([{
      product_id: item.product_id,
      quantity: item.quantity,
      type: 'Delivery',
      date: new Date().toISOString()
    }]);
  }
  
  const { data, error } = await supabase
    .from('deliveries')
    .update({ status: 'Done' })
    .eq('id', id)
    .select();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data[0]);
};
