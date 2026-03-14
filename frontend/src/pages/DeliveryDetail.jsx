import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Check, Printer } from 'lucide-react';

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => deliveriesApi.getById(id)
  });

  const validateMutation = useMutation({
    mutationFn: () => deliveriesApi.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    }
  });

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (!delivery) return <div className="text-white">Delivery not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/deliveries')} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-white tracking-tight flex-1">
          {delivery.reference}
        </h2>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="bg-card border border-slate-800 rounded-xl shadow-lg p-6 mb-6">
        
        {delivery.status === 'Draft' && (
          <div className="flex gap-3 mb-6 pb-6 border-b border-slate-800">
            <button
              onClick={() => validateMutation.mutate()}
              disabled={validateMutation.isPending}
              className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {validateMutation.isPending ? 'Validating...' : 'Validate'}
            </button>
            <button
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-medium border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        )}

        {Object.keys(delivery).length > 0 && (
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="font-semibold text-slate-400 mb-1">Customer Address</p>
              <p className="text-white text-lg">{delivery.customer}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-400 mb-1">Schedule Date</p>
              <p className="text-white text-lg">{new Date(delivery.date).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-white mb-4">Operations</h3>
        <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-900/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold text-right">Done</th>
              </tr>
            </thead>
            <tbody>
              {delivery.delivery_items?.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-white">{item.products?.name}</td>
                  <td className="px-4 py-3 text-slate-400">{item.products?.sku}</td>
                  <td className="px-4 py-3 text-right font-medium text-white">{item.quantity}</td>
                </tr>
              ))}
              {(!delivery.delivery_items || delivery.delivery_items.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500 italic">No products in this delivery</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
