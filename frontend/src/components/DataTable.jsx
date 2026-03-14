import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

export default function DataTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
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
  )
}
