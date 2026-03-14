import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Rows3 } from 'lucide-react';
import { useState } from 'react';
import { stockApi } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function MoveHistory() {
  const [viewMode, setViewMode] = useState('table');
  const { data: moves = [], isLoading } = useQuery({ queryKey: ['stock-moves'], queryFn: stockApi.getMoves });

  const moveTypes = ['Receipt', 'Delivery', 'Transfer', 'Adjustment'];
  const groupedMoves = moveTypes.map((type) => ({
    type,
    items: moves.filter((move) => move.type === type)
  }));
  const uncategorized = moves.filter((move) => !moveTypes.includes(move.type));
  if (uncategorized.length > 0) {
    groupedMoves.push({ type: 'Other', items: uncategorized });
  }

  const columns = [
    { accessorKey: 'type', header: 'Reference Type' },
    { accessorKey: 'date', header: 'Date', cell: info => new Date(info.getValue()).toLocaleString() },
    { accessorKey: 'products.name', header: 'Product' },
    { accessorKey: 'quantity', header: 'Quantity Logged' },
    { accessorKey: 'status', header: 'Ledger Status', cell: () => <StatusBadge status="Done" /> },
  ];

  if (isLoading) return <div className="text-white p-8">Fetching ledger entries...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Stock Movements Ledger</h2>
          <p className="text-gray-400 text-sm mt-1">Immutable history of inventory changes</p>
        </div>
        <div className="flex rounded-lg border border-white/10 bg-secondary p-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
              viewMode === 'table' ? 'bg-[#232C63] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Rows3 className="w-4 h-4" />
            Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
              viewMode === 'kanban' ? 'bg-[#232C63] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={columns} data={moves} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {groupedMoves.map((column) => (
            <div key={column.type} className="rounded-xl border border-white/10 bg-card/70 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{column.type}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-gray-300 border border-white/10">
                  {column.items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {column.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-gray-500 text-center">
                    No entries
                  </div>
                ) : (
                  column.items.map((move) => (
                    <div
                      key={move.id}
                      className="rounded-lg border border-white/10 bg-secondary/70 p-3 hover:border-accent/50 hover:bg-[#232C63] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-white truncate">{move.products?.name || 'Unknown Product'}</p>
                        <StatusBadge status="Done" />
                      </div>
                      <div className="mt-3 text-xs text-gray-300 space-y-1">
                        <p>Qty: {move.quantity}</p>
                        <p className="text-gray-400">{new Date(move.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
