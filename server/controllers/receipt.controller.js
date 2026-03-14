import { supabase } from '../config/supabase.js';

const RECEIPT_ALLOWED_TRANSITIONS = {
  Draft: ['Ready', 'Canceled'],
  Ready: ['Done', 'Canceled'],
  Done: [],
  Canceled: []
};

const isReceiptTransitionAllowed = (fromStatus, toStatus) => {
  const allowedTargets = RECEIPT_ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowedTargets.includes(toStatus);
};

const applyReceiptCompletion = async (receiptId) => {
  const { data: receiptItems, error: itemsError } = await supabase
    .from('receipt_items')
    .select('*')
    .eq('receipt_id', receiptId);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  for (const item of receiptItems) {
    const { data: existingStock } = await supabase
      .from('stock')
      .select('*')
      .eq('product_id', item.product_id)
      .limit(1)
      .single();

    if (existingStock) {
      await supabase
        .from('stock')
        .update({ quantity: existingStock.quantity + item.quantity })
        .eq('id', existingStock.id);
    } else {
      await supabase
        .from('stock')
        .insert([{ product_id: item.product_id, quantity: item.quantity }]);
    }

    await supabase.from('stock_moves').insert([{
      product_id: item.product_id,
      quantity: item.quantity,
      type: 'Receipt',
      date: new Date().toISOString()
    }]);
  }
};

const updateReceiptStatusInternal = async (receiptId, targetStatus) => {
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', receiptId)
    .single();

  if (receiptError || !receipt) {
    return { statusCode: 404, body: { error: 'Receipt not found' } };
  }

  if (receipt.status === targetStatus) {
    return { statusCode: 200, body: receipt };
  }

  if (!isReceiptTransitionAllowed(receipt.status, targetStatus)) {
    return {
      statusCode: 400,
      body: { error: `Invalid status transition: ${receipt.status} -> ${targetStatus}` }
    };
  }

  if (targetStatus === 'Done') {
    await applyReceiptCompletion(receiptId);
  }

  const { data, error } = await supabase
    .from('receipts')
    .update({ status: targetStatus })
    .eq('id', receiptId)
    .select()
    .single();

  if (error) {
    return { statusCode: 500, body: { error: error.message } };
  }

  return { statusCode: 200, body: data };
};

export const getReceipts = async (req, res) => {
  const { data, error } = await supabase.from('receipts').select(`
    *,
    receipt_items (*, products (name, sku))
  `);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createReceipt = async (req, res) => {
  const { reference, supplier, date, items } = req.body;
  // items: [{ product_id, quantity }]
  
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .insert([{ reference, supplier, date, status: 'Draft' }])
    .select()
    .single();
    
  if (receiptError) return res.status(500).json({ error: receiptError.message });
  
  if (items && items.length > 0) {
    const receiptItems = items.map(item => ({
      receipt_id: receipt.id,
      product_id: item.product_id,
      quantity: item.quantity
    }));
    const { error: itemsError } = await supabase.from('receipt_items').insert(receiptItems);
    if (itemsError) return res.status(500).json({ error: itemsError.message });
  }
  
  res.status(201).json(receipt);
};

export const getReceiptById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      *,
      receipt_items (*, products (name, sku))
    `)
    .eq('id', id)
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const validateReceipt = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await updateReceiptStatusInternal(id, 'Done');
    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to validate receipt' });
  }
};

export const updateReceiptStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Draft', 'Ready', 'Done', 'Canceled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const result = await updateReceiptStatusInternal(id, status);
    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update receipt status' });
  }
};
