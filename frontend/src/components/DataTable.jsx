import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Download } from 'lucide-react'
import Papa from 'papaparse'

export default function DataTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleExport = () => {
    // Extract formatted data using row model and column headers
    const exportData = table.getRowModel().rows.map(row => {
      const rowData = {};
      row.getVisibleCells().forEach(cell => {
         // Skip columns that might just be Action buttons (like View/Edit)
         if (cell.column.id !== 'actions') {
           rowData[cell.column.columnDef.header] = cell.getValue();
         }
      });
      return rowData;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `export_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center text-sm font-medium text-gray-300 hover:text-white px-4 py-2 bg-secondary rounded-lg border border-white/10 hover:border-accent/50 transition-colors gap-2"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>
      <div className="rounded-xl border border-white/5 overflow-hidden bg-card shadow-lg">
        <table className="w-full text-sm text-left font-inter">
        <thead className="bg-[#141B3A]/80 backdrop-blur-sm border-b border-white/5 uppercase text-xs">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-4 font-semibold text-gray-300 tracking-wider">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-white/5">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className="hover:bg-[#232C63] transition-colors duration-150 group"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-gray-200 group-hover:text-white transition-colors duration-150">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 font-medium">
                No data available in table
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  )
}
