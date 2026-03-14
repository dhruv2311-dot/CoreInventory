import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-slate-800 bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center px-8 justify-between">
          <h1 className="text-xl font-semibold text-white">CoreInventory</h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
              Admin
            </div>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
