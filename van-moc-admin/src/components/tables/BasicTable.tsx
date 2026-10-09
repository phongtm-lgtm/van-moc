import type { ReactNode } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'

// Adapted from TailAdmin components/tables/BasicTables/BasicTableOne.tsx.
// Container, header, row/cell typography and dark styles are retained.
export default function BasicTable({ headers, rows }: { headers: string[]; rows: { id: string; cells: ReactNode[] }[] }) {
  return <div className="admin-data-table">
    <div className="max-w-full overflow-x-auto"><Table>
      <TableHeader className="border-b border-gray-100 dark:border-white/5"><TableRow>
        {headers.map(header => <TableCell key={header} isHeader className="px-5 py-3 text-start text-theme-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">{header}</TableCell>)}
      </TableRow></TableHeader>
      <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
        {rows.map(row => <TableRow key={row.id}>{row.cells.map((cell, index) => <TableCell key={index} className={index === 0 ? 'px-5 py-4 text-start whitespace-nowrap sm:px-6' : 'px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400'}>{cell}</TableCell>)}</TableRow>)}
      </TableBody>
    </Table></div>
  </div>
}
