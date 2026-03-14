import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { stockApi, receiptsApi, deliveriesApi } from '../services/api';
import KPICard from '../components/KPICard';

export default function Dashboard() {
  const { data: stock = [] } = useQuery({ queryKey: ['stock'], queryFn: stockApi.getAll });
  const { data: stockMoves = [] } = useQuery({ queryKey: ['stock-moves'], queryFn: stockApi.getMoves });
  const { data: receipts = [] } = useQuery({ queryKey: ['receipts'], queryFn: receiptsApi.getAll });
  const { data: deliveries = [] } = useQuery({ queryKey: ['deliveries'], queryFn: deliveriesApi.getAll });

  const totalProducts = stock.length;
  const lowStockItems = stock.filter(s => s.quantity < 10).length;
  const pendingReceipts = receipts.filter(r => r.status !== 'Done').length;
  const pendingDeliveries = deliveries.filter(d => d.status !== 'Done').length;

  const chartData = useMemo(() => {
    const monthsToShow = 6;
    const now = new Date();
    const monthBuckets = [];

    for (let i = monthsToShow - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        name: d.toLocaleString(undefined, { month: 'short' }),
        inbound: 0,
        outbound: 0,
      });
    }

    const bucketMap = Object.fromEntries(monthBuckets.map((b) => [b.key, b]));

    stockMoves.forEach((move) => {
      if (!move?.date) return;
      const moveDate = new Date(move.date);
      if (Number.isNaN(moveDate.getTime())) return;

      const key = `${moveDate.getFullYear()}-${String(moveDate.getMonth() + 1).padStart(2, '0')}`;
      const bucket = bucketMap[key];
      if (!bucket) return;

      const qty = Number(move.quantity) || 0;
      const type = String(move.type || '').toLowerCase();

      const isInbound = type.includes('receipt') || type.includes('adjustment (in)');
      const isOutbound = type.includes('delivery') || type.includes('adjustment (out)');

      if (isInbound) {
        bucket.inbound += qty;
      } else if (isOutbound) {
        bucket.outbound += qty;
      } else {
        // Internal transfer and unknown types still count as movement volume.
        bucket.outbound += qty;
        bucket.inbound += qty;
      }
    });

    return monthBuckets.map((bucket) => ({
      name: bucket.name,
      inbound: bucket.inbound,
      outbound: bucket.outbound,
      movement: bucket.inbound + bucket.outbound,
    }));
  }, [stockMoves]);

  const displayChartData = useMemo(() => {
    const hasRealMovement = chartData.some((item) => (item.movement || 0) > 0);

    if (hasRealMovement) {
      return { isDemo: false, data: chartData };
    }

    // Fallback sample keeps dashboard visually informative before live operations start.
    const demoData = chartData.map((item, idx) => {
      const seed = [18, 26, 22, 31, 28, 36][idx] || 20;
      return {
        ...item,
        inbound: Math.round(seed * 0.58),
        outbound: Math.round(seed * 0.42),
        movement: seed,
      };
    });

    return { isDemo: true, data: demoData };
  }, [chartData]);

  const last7DaysFlow = useMemo(() => {
    const days = 7;
    const now = new Date();
    const dayBuckets = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(now.getDate() - i);

      dayBuckets.push({
        key: d.toISOString().slice(0, 10),
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        receipts: 0,
        deliveries: 0,
      });
    }

    const bucketMap = Object.fromEntries(dayBuckets.map((b) => [b.key, b]));

    stockMoves.forEach((move) => {
      if (!move?.date) return;
      const d = new Date(move.date);
      if (Number.isNaN(d.getTime())) return;

      const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      const bucket = bucketMap[dayKey];
      if (!bucket) return;

      const qty = Number(move.quantity) || 0;
      const type = String(move.type || '').toLowerCase();

      if (type.includes('receipt') || type.includes('adjustment (in)')) {
        bucket.receipts += qty;
      } else if (type.includes('delivery') || type.includes('adjustment (out)')) {
        bucket.deliveries += qty;
      }
    });

    const data = dayBuckets.map((b) => ({
      name: b.name,
      receipts: b.receipts,
      deliveries: -b.deliveries,
      net: b.receipts - b.deliveries,
    }));

    const hasReal = data.some((row) => row.receipts !== 0 || row.deliveries !== 0);
    if (hasReal) return { isDemo: false, data };

    // Fallback sample for visual continuity on fresh databases.
    const demo = [
      { name: 'Mon', receipts: 50, deliveries: -10, net: 40 },
      { name: 'Tue', receipts: 20, deliveries: -28, net: -8 },
      { name: 'Wed', receipts: 30, deliveries: -14, net: 16 },
      { name: 'Thu', receipts: 42, deliveries: -20, net: 22 },
      { name: 'Fri', receipts: 26, deliveries: -32, net: -6 },
      { name: 'Sat', receipts: 38, deliveries: -18, net: 20 },
      { name: 'Sun', receipts: 22, deliveries: -16, net: 6 },
    ];

    return { isDemo: true, data: demo };
  }, [stockMoves]);

  const pieSummary = useMemo(() => {
    const totals = last7DaysFlow.data.reduce(
      (acc, row) => {
        acc.receipts += Number(row.receipts) || 0;
        acc.deliveries += Math.abs(Number(row.deliveries) || 0);
        return acc;
      },
      { receipts: 0, deliveries: 0 }
    );

    return [
      { name: 'Receipts (+)', value: totals.receipts, color: '#22C55E' },
      { name: 'Deliveries (-)', value: totals.deliveries, color: '#EF4444' },
    ];
  }, [last7DaysFlow.data]);

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="theme-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white font-poppins">Inventory Movement Trend</h3>
            {displayChartData.isDemo && (
              <span className="text-xs px-2 py-1 rounded-md border border-warning/30 text-warning bg-warning/10">
                Sample data
              </span>
            )}
          </div>
          <div className="h-80 w-full mt-4 min-h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={280}>
              <LineChart data={displayChartData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C2452', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#E8C77B' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="movement" 
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

        <div className="theme-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white font-poppins">Inventory Movement (Last 7 Days)</h3>
            {last7DaysFlow.isDemo && (
              <span className="text-xs px-2 py-1 rounded-md border border-warning/30 text-warning bg-warning/10">
                Sample data
              </span>
            )}
          </div>
          <div className="h-80 w-full mt-4 min-h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={280}>
              <PieChart>
                <Tooltip
                  formatter={(value, key) => {
                    const val = Number(value) || 0;
                    return [val, String(key)];
                  }}
                  contentStyle={{ backgroundColor: '#1C2452', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Pie
                  data={pieSummary}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={108}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieSummary.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Pie chart summarizes total inbound vs outbound quantity for the last 7 days.
          </p>
        </div>
      </div>
    </div>
  );
}
