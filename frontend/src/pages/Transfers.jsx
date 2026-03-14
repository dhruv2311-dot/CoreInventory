import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, ArrowRightLeft } from 'lucide-react';
import { stockApi, productsApi, locationApi } from '../services/api';
import DataTable from '../components/DataTable';

export default function Transfers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', from_location: '', to_location: '', quantity: '' });
  const [error, setError] = useState('');

  const { data: moves = [], isLoading } = useQuery({ 
    queryKey: ['stock-moves'], 
    queryFn: stockApi.getMoves 
  });

  const internalMoves = moves.filter(m => m.type === 'Internal Transfer');

  const { data: stock = [] } = useQuery({ queryKey: ['stock'], queryFn: stockApi.getAll });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: productsApi.getAll });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: locationApi.getAll });

  const transferMutation = useMutation({
    mutationFn: stockApi.transfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-moves'] });
      setIsModalOpen(false);
      setFormData({ product_id: '', from_location: '', to_location: '', quantity: '' });
      setError('');
    },
    onError: (err) => setError(err.message)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Convert to number explicitly
    transferMutation.mutate({
      ...formData,
      quantity: Number(formData.quantity)
    });
  };

  const columns = [
    { accessorKey: 'products.name', header: 'Product' },
    { accessorKey: 'from_loc.name', header: 'Source Location' },
    { accessorKey: 'to_loc.name', header: 'Destination' },
    { accessorKey: 'quantity', header: 'Quantity Logged' },
    { accessorKey: 'date', header: 'Date', cell: info => new Date(info.getValue()).toLocaleString() },
  ];

  if (isLoading) return <div className="text-white p-8">Loading internal transfers...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Internal Transfers</h2>
          <p className="text-gray-400 text-sm mt-1">Move items freely between bins and warehouses</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Transfer Stock
        </button>
      </div>

      <DataTable columns={columns} data={internalMoves} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="theme-card w-full max-w-lg relative border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold text-white mb-6 font-poppins">New Internal Transport</h3>
            
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                <span className="shrink-0">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Product</label>
                <select
                  required
                  value={formData.product_id}
                  onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                  className="theme-input w-full"
                >
                  <option value="" className="bg-secondary">Select product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="bg-secondary">{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 text-danger font-semibold">From Location</label>
                  <select
                    required
                    value={formData.from_location}
                    onChange={e => setFormData({ ...formData, from_location: e.target.value })}
                    className="theme-input w-full border-danger/30 focus:border-danger focus:ring-danger"
                  >
                    <option value="" className="bg-secondary">Source node...</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id} className="bg-secondary">{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 text-success font-semibold">To Location</label>
                  <select
                    required
                    value={formData.to_location}
                    onChange={e => setFormData({ ...formData, to_location: e.target.value })}
                    className="theme-input w-full border-success/30 focus:border-success focus:ring-success"
                  >
                    <option value="" className="bg-secondary">Target node...</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id} className="bg-secondary">{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Quantity to Transit</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="theme-input w-full text-lg font-semibold"
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferMutation.isPending}
                  className="btn-primary"
                >
                  {transferMutation.isPending ? 'Processing...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
