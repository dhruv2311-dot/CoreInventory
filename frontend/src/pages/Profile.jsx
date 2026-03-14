import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User, Mail, Shield, Calendar, Package, ArrowDownToLine,
  ArrowUpFromLine, Edit3, Save, X, LogOut, Key, ChevronRight,
  CheckCircle2, Clock, XCircle, BarChart3
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { receiptsApi, deliveriesApi, stockApi } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuthStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || user?.login_id || 'User');
  const [tempName, setTempName] = useState(displayName);

  const { data: receipts = [] } = useQuery({ queryKey: ['receipts'], queryFn: receiptsApi.getAll });
  const { data: deliveries = [] } = useQuery({ queryKey: ['deliveries'], queryFn: deliveriesApi.getAll });
  const { data: stock = [] } = useQuery({ queryKey: ['stock'], queryFn: stockApi.getAll });
  const { data: stockMoves = [] } = useQuery({ queryKey: ['stock-moves'], queryFn: stockApi.getMoves });

  // Derived stats
  const doneReceipts = receipts.filter(r => r.status === 'Done').length;
  const doneDeliveries = deliveries.filter(d => d.status === 'Done').length;
  const pendingReceipts = receipts.filter(r => r.status === 'Draft' || r.status === 'Ready').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'Draft' || d.status === 'Ready').length;
  const canceledItems = [...receipts, ...deliveries].filter(x => x.status === 'Canceled').length;
  const totalMoves = stockMoves.length;
  const totalStockLines = stock.length;

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveName = () => {
    if (tempName.trim()) setDisplayName(tempName.trim());
    setIsEditingName(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    {
      label: 'Receipts Done',
      value: doneReceipts,
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Deliveries Done',
      value: doneDeliveries,
      icon: CheckCircle2,
      color: 'text-accentblue',
      bg: 'bg-accentblue/10',
    },
    {
      label: 'Pending Operations',
      value: pendingReceipts + pendingDeliveries,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Canceled',
      value: canceledItems,
      icon: XCircle,
      color: 'text-danger',
      bg: 'bg-danger/10',
    },
    {
      label: 'Stock Moves',
      value: totalMoves,
      icon: BarChart3,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Product Lines',
      value: totalStockLines,
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ];

  const recentActivity = [...receipts, ...deliveries]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 8)
    .map(item => ({
      ...item,
      type: item.supplier !== undefined ? 'receipt' : 'delivery',
    }));

  const statusColor = (status) => {
    if (status === 'Done') return 'text-success bg-success/10';
    if (status === 'Ready') return 'text-accentblue bg-accentblue/10';
    if (status === 'Canceled') return 'text-danger bg-danger/10';
    return 'text-warning bg-warning/10';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-poppins">My Profile</h1>
        <p className="text-muted text-sm mt-1">View and manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Identity Card ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar + Name */}
          <div className="bg-card border border-white/5 rounded-xl p-6 flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-accent to-accentblue flex items-center justify-center text-3xl font-bold text-black select-none shadow-lg">
                {initials}
              </div>
              <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card ${isAdmin ? 'bg-accent' : 'bg-success'}`}></div>
            </div>

            {/* Editable display name */}
            {isEditingName ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  autoFocus
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                  className="flex-1 bg-secondary border border-accent rounded-lg px-3 py-1.5 text-sm text-foreground text-center focus:outline-none"
                />
                <button onClick={handleSaveName} className="text-success hover:opacity-80 transition-opacity">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditingName(false)} className="text-danger hover:opacity-80 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground font-poppins">{displayName}</h2>
                <button
                  onClick={() => { setTempName(displayName); setIsEditingName(true); }}
                  className="text-muted hover:text-accent transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Role badge */}
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isAdmin
                ? 'bg-accent/15 text-accent border-accent/30'
                : 'bg-accentblue/15 text-accentblue border-accentblue/30'
            }`}>
              {isAdmin ? 'Inventory Manager' : 'Warehouse Staff'}
            </span>

            {/* Account details */}
            <div className="w-full space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted shrink-0" />
                <span className="text-muted">Employee ID</span>
                <span className="ml-auto font-medium text-foreground font-mono text-xs">{user?.login_id || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted shrink-0" />
                <span className="text-muted">Email</span>
                <span className="ml-auto font-medium text-foreground text-xs truncate max-w-30">{user?.email || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-muted shrink-0" />
                <span className="text-muted">Access</span>
                <span className="ml-auto font-medium text-foreground text-xs">{isAdmin ? 'Admin' : 'Staff'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted shrink-0" />
                <span className="text-muted">Member since</span>
                <span className="ml-auto font-medium text-foreground text-xs">{memberSince}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Quick Actions</p>
            </div>
            <div className="divide-y divide-white/5">
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary transition-colors text-left group"
              >
                <Key className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                <span className="text-sm text-foreground">Change Password</span>
                <ChevronRight className="w-4 h-4 text-muted ml-auto" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary transition-colors text-left group"
              >
                <BarChart3 className="w-4 h-4 text-muted group-hover:text-accentblue transition-colors" />
                <span className="text-sm text-foreground">Go to Dashboard</span>
                <ChevronRight className="w-4 h-4 text-muted ml-auto" />
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-danger/10 transition-colors text-left group"
              >
                <LogOut className="w-4 h-4 text-danger" />
                <span className="text-sm text-danger font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Stats + Activity ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats grid */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Activity Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {statCards.map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-card border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                    <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-foreground font-poppins">{card.value}</p>
                    <p className="text-xs text-muted leading-tight">{card.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Recent Operations</h3>
              <span className="text-xs text-muted">{recentActivity.length} entries</span>
            </div>

            {recentActivity.length === 0 ? (
              <div className="px-5 py-12 text-center text-muted text-sm">No operations yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentActivity.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.type === 'receipt' ? `/receipts/${item.id}` : `/deliveries/${item.id}`)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-secondary transition-colors text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'receipt' ? 'bg-success/10' : 'bg-accentblue/10'
                    }`}>
                      {item.type === 'receipt'
                        ? <ArrowDownToLine className="w-4 h-4 text-success" />
                        : <ArrowUpFromLine className="w-4 h-4 text-accentblue" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.reference}</p>
                      <p className="text-xs text-muted">
                        {item.type === 'receipt' ? `Supplier: ${item.supplier || '—'}` : `Customer: ${item.customer || '—'}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {item.date && (
                        <span className="text-xs text-muted hidden sm:block">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {(receipts.length + deliveries.length) > 8 && (
              <div className="px-5 py-3 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => navigate('/receipts')}
                  className="text-xs text-accentblue hover:underline flex items-center gap-1"
                >
                  <ArrowDownToLine className="w-3 h-3" /> All Receipts
                </button>
                <button
                  onClick={() => navigate('/deliveries')}
                  className="text-xs text-accentblue hover:underline flex items-center gap-1"
                >
                  <ArrowUpFromLine className="w-3 h-3" /> All Deliveries
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
