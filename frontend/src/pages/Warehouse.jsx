export default function Warehouse() {
  const warehouses = [
    { id: 1, name: 'Central Warehouse', code: 'CW01', address: 'Mumbai' }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Warehouse Nodes</h2>
          <p className="text-gray-400 text-sm mt-1">Manage corporate physical sites</p>
        </div>
      </div>

      <div className="theme-card p-0 !border-0 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#141B3A] border-b border-white/5 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-300">Warehouse Name</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Short Code</th>
              <th className="px-6 py-4 font-semibold text-gray-300">Location Area</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {warehouses.map((w) => (
              <tr key={w.id} className="hover:bg-[#232C63] transition-colors duration-150">
                <td className="px-6 py-5 text-white">{w.name}</td>
                <td className="px-6 py-5 text-gray-300">{w.code}</td>
                <td className="px-6 py-5 text-gray-300">{w.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
