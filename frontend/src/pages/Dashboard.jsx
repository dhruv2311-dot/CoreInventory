import { useQuery } from '@tanstack/react-query';
import { Package, ArrowDownToLine, ArrowUpFromLine, RefreshCw, AlertTriangle } from 'lucide-react';
import { stockApi, receiptsApi, deliveriesApi } from '../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-card p-6 rounded-xl border border-slate-800 shadow-lg flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
    <div className={`p-4 rounded-full ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export default function Dashboard() {
  const { data: stock = [] } = useQuery({ queryKey: ['stock'], queryFn: stockApi.getAll });
  const { data: receipts = [] } = useQuery({ queryKey: ['receipts'], queryFn: receiptsApi.getAll });
  const { data: deliveries = [] } = useQuery({ queryKey: ['deliveries'], queryFn: deliveriesApi.getAll });

  const totalProducts = stock.length;
  // Let's assume low stock is below 10 for any item
  const lowStockItems = stock.filter(s => s.quantity < 10).length;
  const pendingReceipts = receipts.filter(r => r.status !== 'Done').length;
  const pendingDeliveries = deliveries.filter(d => d.status !== 'Done').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Overview of your inventory operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products in Stock" 
          value={totalProducts} 
          icon={Package} 
          colorClass="bg-primary/80" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStockItems} 
          icon={AlertTriangle} 
          colorClass="bg-warning/80" 
        />
        <StatCard 
          title="Pending Receipts" 
          value={pendingReceipts} 
          icon={ArrowDownToLine} 
          colorClass="bg-accent/80" 
        />
        <StatCard 
          title="Pending Deliveries" 
          value={pendingDeliveries} 
          icon={ArrowUpFromLine} 
          colorClass="bg-danger/80" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-card border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Mock recent activity until we fetch full history if needed */}
            <p className="text-sm text-slate-400 italic">Recent movements will appear here.</p>
          </div>
        </div>
        
        <div className="bg-card border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stock Alerts</h3>
          <div className="space-y-4">
            {stock.filter(s => s.quantity < 10).map(s => (
              <div key={s.id} className="flex justify-between items-center p-3 rounded-md bg-warning/10 border border-warning/20">
                <span className="text-sm font-medium text-warning">{s.products?.name} (SKU: {s.products?.sku})</span>
                <span className="text-sm text-warning font-bold">{s.quantity} {s.products?.unit} left</span>
              </div>
            ))}
            {lowStockItems === 0 && (
              <p className="text-sm text-slate-400 italic">No low stock items.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
