import { DataTable } from '@/components/DataTable'
import { Download } from 'lucide-react'

interface Query {
  id: string
  product: string
  category: string
  price: number
  stock: number
  date: string
}

const SAMPLE_QUERIES: Query[] = [
  { id: '1', product: 'Producto A', category: 'Electrónica', price: 100, stock: 50, date: '01-02-2026' },
  { id: '2', product: 'Producto B', category: 'Hogar', price: 200, stock: 30, date: '01-02-2026' },
  { id: '3', product: 'Producto C', category: 'Accesorios', price: 75, stock: 100, date: '01-02-2026' },
  { id: '4', product: 'Producto D', category: 'Electrónica', price: 150, stock: 25, date: '01-02-2026' },
  { id: '5', product: 'Producto E', category: 'Hogar', price: 120, stock: 60, date: '01-02-2026' },
]

export function QueriesPage() {
  const columns = [
    { key: 'product' as const, label: 'Producto', sortable: true },
    { key: 'category' as const, label: 'Categoría', sortable: true },
    { key: 'price' as const, label: 'Precio', sortable: true, render: (v: number) => `$${v}` },
    { key: 'stock' as const, label: 'Stock', sortable: true },
    { key: 'date' as const, label: 'Fecha', sortable: true },
  ]

  const handleExport = () => {
    alert('Exportar a Excel - Próximamente')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Consultas</h1>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download size={20} />
          Exportar Excel
        </button>
      </div>

      <DataTable columns={columns} data={SAMPLE_QUERIES} itemsPerPage={10} />
    </div>
  )
}
