import { useQuery } from '@tanstack/react-query';
import { Clock3, LayoutGrid, Rows3 } from 'lucide-react';
import { useState } from 'react';
import { stockApi } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const getTimelineOwnership = (move) => {
  const type = String(move.type || '').toLowerCase();

  if (type.includes('receipt')) {
    return {
      primaryRole: 'Warehouse Staff',
      action: 'Receiving and shelving incoming goods',
      managerStep: 'Inventory Manager monitors receipt completion and stock visibility',
    };
  }

  if (type.includes('delivery')) {
    return {
      primaryRole: 'Warehouse Staff',
      action: 'Picking and staging outbound goods',
      managerStep: 'Inventory Manager tracks fulfillment and dispatch readiness',
    };
  }

  if (type.includes('transfer')) {
    return {
      primaryRole: 'Warehouse Staff',
      action: 'Moving stock between locations and shelves',
      managerStep: 'Inventory Manager monitors inventory balance across locations',
    };
  }

  return {
    primaryRole: 'Inventory Manager',
    action: 'Reviewing stock control and inventory adjustments',
    managerStep: 'Warehouse Staff typically perform count checks before final validation',
  };
};

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

  const timelineItems = moves.map((move) => ({
    ...move,
    ownership: getTimelineOwnership(move),
  }));

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
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
              viewMode === 'timeline' ? 'bg-[#232C63] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock3 className="w-4 h-4" />
            Timeline
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={columns} data={moves} />
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {groupedMoves.map((column) => (
            <div key={column.type} className="rounded-xl border border-white/10 bg-card/70 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{column.type}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-gray-300 border border-white/10">
                  {column.items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-30">
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
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-card/70 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Role-Aligned Operations Timeline</h3>
            <p className="text-sm text-gray-400">
              Inventory Managers oversee stock accuracy, product records, receipts, and deliveries. Warehouse Staff execute receiving,
              transfers, picking, shelving, and counting in the live operation flow below.
            </p>
          </div>

          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10"></div>
            <div className="space-y-4">
              {timelineItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-gray-400 text-center bg-card/50">
                  No timeline events available yet.
                </div>
              ) : (
                timelineItems.map((move) => (
                  <div key={move.id} className="relative">
                    <div className="absolute -left-[1.05rem] top-5 h-3 w-3 rounded-full bg-accent border-2 border-primary"></div>
                    <div className="rounded-xl border border-white/10 bg-card/70 p-4 hover:border-accent/40 transition-colors">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{move.products?.name || 'Unknown Product'}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-gray-300 border border-white/10">
                              {move.type}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              move.ownership.primaryRole === 'Inventory Manager'
                                ? 'bg-accent/10 text-accent border-accent/20'
                                : 'bg-accentblue/10 text-accentblue border-accentblue/20'
                            }`}>
                              {move.ownership.primaryRole}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{move.ownership.action}</p>
                          <p className="text-xs text-gray-400">{move.ownership.managerStep}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                            <span>Qty: {move.quantity}</span>
                            {move.from_loc?.name && <span>From: {move.from_loc.name}</span>}
                            {move.to_loc?.name && <span>To: {move.to_loc.name}</span>}
                            {move.products?.sku && <span>SKU: {move.products.sku}</span>}
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                          <StatusBadge status="Done" />
                          <span className="text-xs text-gray-400">{new Date(move.date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
