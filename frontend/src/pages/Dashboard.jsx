import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { stockApi, receiptsApi, deliveriesApi } from '../services/api';
import KPICard from '../components/KPICard';

export default function Dashboard() {
  const { data: stock = [] } = useQuery({ queryKey: ['stock'], queryFn: stockApi.getAll });
  const { data: receipts = [] } = useQuery({ queryKey: ['receipts'], queryFn: receiptsApi.getAll });
  const { data: deliveries = [] } = useQuery({ queryKey: ['deliveries'], queryFn: deliveriesApi.getAll });

  const totalProducts = stock.length;
  const lowStockItems = stock.filter(s => s.quantity < 10).length;
  const pendingReceipts = receipts.filter(r => r.status !== 'Done').length;
  const pendingDeliveries = deliveries.filter(d => d.status !== 'Done').length;

  const chartData = [
    { name: 'Jan', stock: 400 },
    { name: 'Feb', stock: 300 },
    { name: 'Mar', stock: 200 },
    { name: 'Apr', stock: 278 },
    { name: 'May', stock: 189 },
    { name: 'Jun', stock: 239 },
    { name: 'Jul', stock: 349 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Dashboard Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time metrics and analytical insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Products" 
          value={totalProducts} 
          icon={Package} 
          isPositive={true}
          percentageString="14%"
        />
        <KPICard 
          title="Low Stock Alerts" 
          value={lowStockItems} 
          icon={AlertTriangle} 
          isPositive={false}
          percentageString="2%"
        />
        <KPICard 
          title="Pending Receipts" 
          value={pendingReceipts} 
          icon={ArrowDownToLine} 
          isPositive={true}
          percentageString="8%"
        />
        <KPICard 
          title="Pending Deliveries" 
          value={pendingDeliveries} 
          icon={ArrowUpFromLine} 
          isPositive={false}
          percentageString="5%"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8">
        <div className="theme-card">
          <h3 className="text-lg font-semibold text-white mb-6 font-poppins">Inventory Movement Trend</h3>
          <div className="h-80 w-full mt-4 min-h-[320px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C2452', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#E8C77B' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="stock" 
                  stroke="#E8C77B" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#141B3A', stroke: '#E8C77B', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#E8C77B' }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
