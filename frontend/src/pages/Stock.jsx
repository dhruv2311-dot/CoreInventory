import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi, productsApi } from '../services/api';
import DataTable from '../components/DataTable';
import { Edit2, X, AlertTriangle } from 'lucide-react';

export default function Stock() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');

  const { data: stock = [], isLoading } = useQuery({ queryKey: ['stock'], queryFn: stockApi.getAll });

  const updateMutation = useMutation({
    mutationFn: stockApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setIsModalOpen(false);
      setEditingStock(null);
      setNewQuantity('');
    }
  });

  const handleEdit = (rowData) => {
    setEditingStock(rowData);
    setNewQuantity(rowData.quantity.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      product_id: editingStock.product_id,
      quantity: Number(newQuantity)
    });
  };

  const columns = [
    { accessorKey: 'products.name', header: 'Product' },
    { accessorKey: 'products.sku', header: 'SKU' },
    { accessorKey: 'products.price', header: 'Trade Price' },
    { accessorKey: 'quantity', header: 'On Hand' },
    { accessorKey: 'quantity', header: 'Free to Use' },
    {
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <button
          onClick={() => handleEdit(info.row.original)}
          className="p-2 text-accent hover:text-white transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  if (isLoading) return <div className="text-white p-8">Loading analytics...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Stock Analysis</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time inventory levels</p>
        </div>
      </div>

      <DataTable columns={columns} data={stock} />

      {isModalOpen && editingStock && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="theme-card w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold text-white mb-2 font-poppins">Inventory Count Adjustment</h3>
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg mb-6">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning leading-relaxed">
                Modifying this value will create a forced Stock Adjustment Move in the ledger. Use for physical counting discrepancy only.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Identification</label>
                <div className="theme-input text-gray-400 bg-secondary/50 cursor-not-allowed">
                  {editingStock.products?.name} ({editingStock.products?.sku})
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">New Physical Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newQuantity}
                  onChange={e => setNewQuantity(e.target.value)}
                  className="theme-input w-full font-semibold text-lg"
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
                  disabled={updateMutation.isPending}
                  className="btn-primary"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
