export default function Warehouse() {
  const warehouses = [
    { id: 1, name: 'Central Warehouse', code: 'CW01', address: 'Mumbai' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Warehouses</h2>
      </div>

      <div className="bg-card border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Warehouse Name</th>
              <th className="px-6 py-4 font-semibold">Short Code</th>
              <th className="px-6 py-4 font-semibold">Address</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 text-slate-300">
                <td className="px-6 py-4">{w.name}</td>
                <td className="px-6 py-4">{w.code}</td>
                <td className="px-6 py-4">{w.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
