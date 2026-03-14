import { supabase } from '../config/supabase.js';

const DELIVERY_ALLOWED_TRANSITIONS = {
  Draft: ['Ready', 'Canceled'],
  Ready: ['Done', 'Canceled'],
  Done: [],
  Canceled: []
};

const isDeliveryTransitionAllowed = (fromStatus, toStatus) => {
  const allowedTargets = DELIVERY_ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowedTargets.includes(toStatus);
};

const applyDeliveryCompletion = async (deliveryId) => {
  const { data: deliveryItems, error: itemsError } = await supabase
    .from('delivery_items')
    .select('*')
    .eq('delivery_id', deliveryId);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  for (const item of deliveryItems) {
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

    await supabase.from('stock_moves').insert([{
      product_id: item.product_id,
      quantity: item.quantity,
      type: 'Delivery',
      date: new Date().toISOString()
    }]);
  }
};

const updateDeliveryStatusInternal = async (deliveryId, targetStatus) => {
  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .select('*')
    .eq('id', deliveryId)
    .single();

  if (deliveryError || !delivery) {
    return { statusCode: 404, body: { error: 'Delivery not found' } };
  }

  if (delivery.status === targetStatus) {
    return { statusCode: 200, body: delivery };
  }

  if (!isDeliveryTransitionAllowed(delivery.status, targetStatus)) {
    return {
      statusCode: 400,
      body: { error: `Invalid status transition: ${delivery.status} -> ${targetStatus}` }
    };
  }

  if (targetStatus === 'Done') {
    await applyDeliveryCompletion(deliveryId);
  }

  const { data, error } = await supabase
    .from('deliveries')
    .update({ status: targetStatus })
    .eq('id', deliveryId)
    .select()
    .single();

  if (error) {
    return { statusCode: 500, body: { error: error.message } };
  }

  return { statusCode: 200, body: data };
};

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
  try {
    const result = await updateDeliveryStatusInternal(id, 'Done');
    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to validate delivery' });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Draft', 'Ready', 'Done', 'Canceled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const result = await updateDeliveryStatusInternal(id, status);
    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update delivery status' });
  }
};
