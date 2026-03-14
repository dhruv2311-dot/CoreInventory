import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RefreshCw, 
  History, 
  Settings, 
  MapPin, 
  Building2,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Receipts', path: '/receipts', icon: ArrowDownToLine },
    { name: 'Deliveries', path: '/deliveries', icon: ArrowUpFromLine },
    { name: 'Stock', path: '/stock', icon: RefreshCw },
    { name: 'Move History', path: '/move-history', icon: History },
  ];

  const settingsItems = [
    { name: 'Warehouse', path: '/warehouse', icon: Building2 },
    { name: 'Locations', path: '/locations', icon: MapPin },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-slate-800 flex flex-col text-white fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-xl text-primary">
        CoreInventory
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Operations
        </div>
        <nav className="space-y-1 px-2 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Settings
        </div>
        <nav className="space-y-1 px-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-danger hover:bg-slate-800 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
