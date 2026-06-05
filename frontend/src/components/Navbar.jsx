import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Search, Bell, Sun, Moon, Settings, X, Package,
  ArrowDownToLine, ArrowUpFromLine, AlertTriangle,
  Info, CheckCheck, RefreshCw
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { productsApi, receiptsApi, deliveriesApi } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationStore } from '../store/notificationStore';

const SEVERITY_STYLES = {
  danger:  { dot: 'bg-danger',     icon: 'text-danger',     bg: 'bg-danger/10',     border: 'border-danger/20' },
  warning: { dot: 'bg-warning',    icon: 'text-warning',    bg: 'bg-warning/10',    border: 'border-warning/20' },
  info:    { dot: 'bg-accentblue', icon: 'text-accentblue', bg: 'bg-accentblue/10', border: 'border-accentblue/20' },
};

export default function Navbar() {
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { readIds, markRead, markAllRead } = useNotificationStore();

  const initials = user
    ? (user.name || user.login_id || 'A')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'A';
  const displayName = user?.name || user?.login_id || 'Admin';

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], receipts: [], deliveries: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Notification state
  const allNotifications = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const unread = allNotifications.filter(n => !readIds.has(n.id));
  const unreadCount = unread.length;

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ products: [], receipts: [], deliveries: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = trimmed.toLowerCase();
        const [products, receipts, deliveries] = await Promise.all([
          productsApi.getAll().catch(() => []),
          receiptsApi.getAll().catch(() => []),
          deliveriesApi.getAll().catch(() => []),
        ]);
        const filtered = {
          products: (products || [])
            .filter(p => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q))
            .slice(0, 4),
          receipts: (receipts || [])
            .filter(r => r.reference?.toLowerCase().includes(q) || r.supplier?.toLowerCase().includes(q))
            .slice(0, 3),
          deliveries: (deliveries || [])
            .filter(d => d.reference?.toLowerCase().includes(q) || d.customer?.toLowerCase().includes(q))
            .slice(0, 3),
        };
        setResults(filtered);
        setShowDropdown(true);
      } catch {
        // silent
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const toggleNotifications = () => {
    setShowNotifications(v => !v);
    setShowDropdown(false);
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setShowNotifications(false);

    if (typeof notif.path === 'string' && notif.path.trim()) {
      navigate(notif.path);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead(allNotifications.map(n => n.id));
  };

  const totalResults = results.products.length + results.receipts.length + results.deliveries.length;

  return (
    <div className="h-16 bg-secondary border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Search */}
      <div className="flex-1 max-w-md" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, receipts, deliveries..."
            className="w-full bg-card rounded-lg pl-10 pr-8 py-2 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-accent border border-transparent focus:border-accent transition-all duration-200"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
              {isSearching && (
                <div className="p-4 text-center text-muted text-sm">Searching…</div>
              )}
              {!isSearching && totalResults === 0 && (
                <div className="p-4 text-center text-muted text-sm">No results for "{query}"</div>
              )}

              {results.products.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider bg-primary/40 border-b border-white/5">
                    Products
                  </div>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { navigate('/products'); clearSearch(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/60 text-left transition-colors"
                    >
                      <Package className="w-4 h-4 text-accent shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{p.name}</div>
                        {p.sku && <div className="text-xs text-muted">SKU: {p.sku}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.receipts.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider bg-primary/40 border-b border-white/5">
                    Receipts
                  </div>
                  {results.receipts.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { navigate(`/receipts/${r.id}`); clearSearch(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/60 text-left transition-colors"
                    >
                      <ArrowDownToLine className="w-4 h-4 text-success shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{r.reference}</div>
                        {r.supplier && <div className="text-xs text-muted">{r.supplier}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.deliveries.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider bg-primary/40 border-b border-white/5">
                    Deliveries
                  </div>
                  {results.deliveries.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { navigate(`/deliveries/${d.id}`); clearSearch(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/60 text-left transition-colors"
                    >
                      <ArrowUpFromLine className="w-4 h-4 text-warning shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{d.reference}</div>
                        {d.customer && <div className="text-xs text-muted">{d.customer}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 ml-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-gray-400 hover:text-foreground transition-colors duration-200"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifications}
            className="p-2 text-gray-400 hover:text-foreground transition-colors duration-200 relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 border border-secondary">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted" />
                  <span className="text-sm font-semibold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-danger text-white font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-muted hover:text-accent flex items-center gap-1 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="text-muted hover:text-foreground transition-colors p-0.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {allNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted">
                    <RefreshCw className="w-8 h-8 opacity-30" />
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs text-center px-6">No alerts right now. Everything looks good.</p>
                  </div>
                ) : (
                  allNotifications.map(notif => {
                    const style = SEVERITY_STYLES[notif.severity] || SEVERITY_STYLES.info;
                    const isRead = readIds.has(notif.id);
                    const SeverityIcon = notif.severity === 'danger' || notif.severity === 'warning'
                      ? AlertTriangle : Info;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary ${isRead ? 'opacity-50' : ''}`}
                      >
                        <div className={`mt-0.5 w-8 h-8 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}>
                          <SeverityIcon className={`w-4 h-4 ${style.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                            {!isRead && <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`}></span>}
                          </div>
                          <p className="text-xs text-muted mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-xs text-accent mt-1 font-medium">Tap to view →</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {allNotifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-white/5 bg-primary/30">
                  <p className="text-xs text-muted text-center">
                    {unreadCount === 0 ? 'All notifications read' : `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/10 mx-2"></div>

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-accent to-accentblue text-black font-bold flex items-center justify-center text-sm">
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">{displayName}</span>
        </button>

        <button className="p-2 text-gray-400 hover:text-foreground transition-colors duration-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

