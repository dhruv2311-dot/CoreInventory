import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

export default function Layout({ children }) {
  useRealtimeSync();

  return (
    <div className="flex bg-primary min-h-screen text-white font-inter">
      <Sidebar />
      <div className="flex-1 min-w-0 ml-[260px] flex flex-col min-h-screen relative">
        <Navbar />
        <main className="p-8 flex-1 min-w-0 overflow-auto bg-primary">
          {children}
        </main>
      </div>
    </div>
  );
}
