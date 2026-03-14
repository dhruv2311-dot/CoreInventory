import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi, receiptsApi, deliveriesApi } from '../services/api';

/**
 * Derives live notifications from API data.
 * Each notification: { id, type, title, message, path, severity }
 * severity: 'warning' | 'info' | 'danger'
 */
export function useNotifications() {
  const { data: stock = [] } = useQuery({ queryKey: ['stock'], queryFn: stockApi.getAll, staleTime: 30_000 });
  const { data: receipts = [] } = useQuery({ queryKey: ['receipts'], queryFn: receiptsApi.getAll, staleTime: 30_000 });
  const { data: deliveries = [] } = useQuery({ queryKey: ['deliveries'], queryFn: deliveriesApi.getAll, staleTime: 30_000 });

  const notifications = useMemo(() => {
    const items = [];

    // ── Low / zero stock alerts ──
    const zeroStock = stock.filter(s => s.quantity === 0);
    const lowStock = stock.filter(s => s.quantity > 0 && s.quantity < 10);

    if (zeroStock.length > 0) {
      items.push({
        id: `zero-stock-${zeroStock.length}`,
        type: 'stock',
        severity: 'danger',
        title: 'Out of Stock',
        message: `${zeroStock.length} product${zeroStock.length > 1 ? 's are' : ' is'} completely out of stock.`,
        path: '/stock',
      });
    }

    if (lowStock.length > 0) {
      items.push({
        id: `low-stock-${lowStock.length}`,
        type: 'stock',
        severity: 'warning',
        title: 'Low Stock Warning',
        message: `${lowStock.length} product${lowStock.length > 1 ? 's have' : ' has'} fewer than 10 units remaining.`,
        path: '/stock',
      });
    }

    // ── Receipts in Draft (never advanced) ──
    const draftReceipts = receipts.filter(r => r.status === 'Draft');
    if (draftReceipts.length > 0) {
      items.push({
        id: `draft-receipts-${draftReceipts.length}`,
        type: 'receipt',
        severity: 'info',
        title: 'Draft Receipts',
        message: `${draftReceipts.length} receipt${draftReceipts.length > 1 ? 's are' : ' is'} still in Draft and waiting to be confirmed.`,
        path: '/receipts',
      });
    }

    // ── Receipts Ready (awaiting validation) ──
    const readyReceipts = receipts.filter(r => r.status === 'Ready');
    if (readyReceipts.length > 0) {
      items.push({
        id: `ready-receipts-${readyReceipts.length}`,
        type: 'receipt',
        severity: 'warning',
        title: 'Receipts Awaiting Validation',
        message: `${readyReceipts.length} receipt${readyReceipts.length > 1 ? 's are' : ' is'} confirmed and ready to be marked Done.`,
        path: '/receipts',
      });
    }

    // ── Deliveries in Draft ──
    const draftDeliveries = deliveries.filter(d => d.status === 'Draft');
    if (draftDeliveries.length > 0) {
      items.push({
        id: `draft-deliveries-${draftDeliveries.length}`,
        type: 'delivery',
        severity: 'info',
        title: 'Draft Deliveries',
        message: `${draftDeliveries.length} deliver${draftDeliveries.length > 1 ? 'ies are' : 'y is'} still in Draft.`,
        path: '/deliveries',
      });
    }

    // ── Deliveries Ready ──
    const readyDeliveries = deliveries.filter(d => d.status === 'Ready');
    if (readyDeliveries.length > 0) {
      items.push({
        id: `ready-deliveries-${readyDeliveries.length}`,
        type: 'delivery',
        severity: 'warning',
        title: 'Deliveries Awaiting Dispatch',
        message: `${readyDeliveries.length} deliver${readyDeliveries.length > 1 ? 'ies are' : 'y is'} ready and waiting to be dispatched.`,
        path: '/deliveries',
      });
    }

    return items;
  }, [stock, receipts, deliveries]);

  return notifications;
}
