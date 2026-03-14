import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function MoveHistory() {
  const { data: moves = [], isLoading } = useQuery({ queryKey: ['stock-moves'], queryFn: stockApi.getMoves });

  const columns = [
    { accessorKey: 'type', header: 'Reference Type' },
    { accessorKey: 'date', header: 'Date', cell: info => new Date(info.getValue()).toLocaleString() },
    { accessorKey: 'products.name', header: 'Product' },
    { accessorKey: 'quantity', header: 'Quantity Logled' },
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
      </div>

      <DataTable columns={columns} data={moves} />
    </div>
  );
}
