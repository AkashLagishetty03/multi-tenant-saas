import React from 'react'

export function DataTable({ columns, data, keyField = 'id', onRowClick }) {
  return (
    <div className="w-full overflow-x-auto bg-card rounded-xl shadow-card border border-surface-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-canvas border-b border-surface-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-4 font-medium text-ink-500 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-ink-500">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={row[keyField]} 
                onClick={() => onRowClick?.(row)}
                className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-50' : ''}`}
              >
                {columns.map((col, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-ink-800">
                    {col.cell ? col.cell(row) : row[col.accessorKey]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
