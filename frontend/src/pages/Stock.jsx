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
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: productsApi.getAll });

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
    { accessorKey: 'products.price', header: 'Price' },
    { accessorKey: 'quantity', header: 'On Hand' },
    { accessorKey: 'quantity', header: 'Free to Use' }, // For simplicity, same as On Hand
    {
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <button
          onClick={() => handleEdit(info.row.original)}
          className="text-primary hover:text-blue-400 p-2 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  if (isLoading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Stock levels</h2>
      </div>

      <DataTable columns={columns} data={stock} />

      {isModalOpen && editingStock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl border border-slate-700 p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold text-white mb-2">Adjust Stock</h3>
            <p className="text-sm text-slate-400 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              This will create an adjustment movement.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Product</label>
                <div className="mt-1 p-2 bg-slate-900 border border-slate-700 rounded-md text-white/50">
                  {editingStock.products?.name} ({editingStock.products?.sku})
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300">New Physical Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newQuantity}
                  onChange={e => setNewQuantity(e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
