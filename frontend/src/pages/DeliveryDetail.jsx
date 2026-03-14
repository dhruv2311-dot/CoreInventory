import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Check, Printer, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => deliveriesApi.getById(id)
  });

  const statusMutation = useMutation({
    mutationFn: (status) => deliveriesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-moves'] });
    }
  });

  if (isLoading) return <div className="text-white p-8">Analyzing delivery...</div>;
  if (!delivery) return <div className="text-white p-8">Delivery not found</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/deliveries')} className="p-2 border border-white/5 rounded-lg bg-secondary text-gray-400 hover:text-white hover:border-accent transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-white tracking-tight flex-1 font-poppins">
          {delivery.reference}
        </h2>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="theme-card">
        
        {(delivery.status === 'Draft' || delivery.status === 'Ready') && (
          <div className="flex gap-4 mb-8 pb-8 border-b border-white/5">
            {isAdmin && delivery.status === 'Draft' && (
              <button
                onClick={() => statusMutation.mutate('Ready')}
                disabled={statusMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {statusMutation.isPending ? 'Updating...' : 'Mark Ready'}
              </button>
            )}

            {isAdmin && delivery.status === 'Ready' && (
              <button
                onClick={() => statusMutation.mutate('Done')}
                disabled={statusMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {statusMutation.isPending ? 'Allocating...' : 'Mark Done'}
              </button>
            )}

            <button
              onClick={() => statusMutation.mutate('Canceled')}
              disabled={statusMutation.isPending}
              className="btn-secondary flex items-center gap-2 bg-secondary text-danger border border-danger/40 hover:bg-danger/10"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}

        {delivery.status === 'Done' && (
          <div className="flex gap-4 mb-8 pb-8 border-b border-white/5">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 bg-secondary text-gray-300 border border-white/10 hover:bg-white/5"
            >
              <Printer className="w-4 h-4" />
              Print Delivery
            </button>
          </div>
        )}

        {Object.keys(delivery).length > 0 && (
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Customer Delivery Endpoint</p>
              <p className="text-white text-lg font-medium">{delivery.customer}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Scheduled Delivery Date</p>
              <p className="text-white text-lg font-medium">{new Date(delivery.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-white mb-4 font-poppins">Outbound Demand</h3>
        <div className="rounded-lg border border-white/10 overflow-hidden bg-secondary/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#141B3A] border-b border-white/10 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">SKU Standard</th>
                <th className="px-6 py-4 font-semibold text-right">Done Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {delivery.delivery_items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#232C63] transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{item.products?.name}</td>
                  <td className="px-6 py-4 text-gray-400">{item.products?.sku}</td>
                  <td className="px-6 py-4 text-right font-medium text-white bg-white/5">{item.quantity}</td>
                </tr>
              ))}
              {(!delivery.delivery_items || delivery.delivery_items.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No products assigned</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
