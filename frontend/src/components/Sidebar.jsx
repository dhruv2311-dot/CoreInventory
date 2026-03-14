import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RefreshCw, 
  History, 
  Building2, 
  MapPin,
  LogOut,
  ArrowRightLeft
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Receipts', path: '/receipts', icon: ArrowDownToLine },
    { name: 'Deliveries', path: '/deliveries', icon: ArrowUpFromLine },
    { name: 'Transfers', path: '/transfers', icon: ArrowRightLeft },
    { name: 'Stock', path: '/stock', icon: RefreshCw },
    { name: 'Move History', path: '/move-history', icon: History },
  ];

  const settingsItems = [
    { name: 'Warehouse', path: '/warehouse', icon: Building2 },
    { name: 'Locations', path: '/locations', icon: MapPin },
  ];

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    
    return (
      <Link
        to={item.path}
        className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 border-l-4 ${
          isActive 
            ? 'bg-card text-accent border-accent' 
            : 'text-gray-300 border-transparent hover:bg-card hover:border-accent'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-accent' : 'text-gray-400'}`} />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="w-[260px] h-screen bg-sidebar flex flex-col fixed top-0 left-0 border-r border-white/5 z-30">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center font-bold text-black font-poppins text-lg">
            C
          </div>
          <span className="font-semibold text-lg text-white font-poppins tracking-wide">
            CoreInventory
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pt-6 flex flex-col gap-6">
        <div>
          <div className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => <NavLink key={item.name} item={item} />)}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <div className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Settings
            </div>
            <nav className="space-y-1">
              {settingsItems.map((item) => <NavLink key={item.name} item={item} />)}
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
