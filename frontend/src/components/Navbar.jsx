import { Search, Bell, Sun, User, Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <div className="h-16 bg-secondary border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search operations, products..." 
            className="w-full bg-card rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-accent border border-transparent focus:border-accent transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
          <Sun className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-secondary"></span>
        </button>
        <div className="w-px h-6 bg-white/10 mx-2"></div>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-accent text-black font-bold flex items-center justify-center text-sm">
            A
          </div>
          <span className="text-sm font-medium text-white hidden sm:block">Admin</span>
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
