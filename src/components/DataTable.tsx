'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchableColumns?: (keyof T)[]
  itemsPerPage?: number
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchableColumns = [],
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((row) =>
      searchableColumns.some((col) => {
        const value = String(row[col]).toLowerCase()
        return value.includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, searchableColumns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredData, sortConfig])

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  const handleSort = (key: keyof T) => {
    const sortable = columns.find((col) => col.key === key)?.sortable !== false
    if (!sortable) return

    setSortConfig((prev) =>
      prev?.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchableColumns.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="px-6 py-3 text-left font-semibold text-foreground"
                    style={{ width: column.width }}
                  >
                    {column.sortable !== false ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        {column.label}
                        {sortConfig?.key === column.key && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No hay datos para mostrar
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-3 text-foreground"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a {Math.min(endIndex, sortedData.length)} de{' '}
          {sortedData.length}
        </p>
        <div className="flex gap-2">
          <Button
            className="h-8 w-8 rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-3 py-2">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            className="h-8 w-8 rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
