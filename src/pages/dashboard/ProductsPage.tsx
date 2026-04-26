import { useState } from 'react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Producto A', sku: 'SKU-001', price: 100, stock: 50, category: 'Electrónica' },
  { id: '2', name: 'Producto B', sku: 'SKU-002', price: 200, stock: 30, category: 'Hogar' },
  { id: '3', name: 'Producto C', sku: 'SKU-003', price: 75, stock: 100, category: 'Accesorios' },
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    stock: 0,
    category: '',
  })

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id)
      setFormData(product)
    } else {
      setEditingId(null)
      setFormData({ name: '', sku: '', price: 0, stock: 0, category: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setProducts(products.map((p) => (p.id === editingId ? { ...p, ...formData } : p)))
    } else {
      setProducts([
        ...products,
        {
          id: String(Date.now()),
          ...formData,
        },
      ])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const columns = [
    { key: 'name' as const, label: 'Nombre', sortable: true },
    { key: 'sku' as const, label: 'Código', sortable: true },
    { key: 'category' as const, label: 'Categoría', sortable: true },
    { key: 'price' as const, label: 'Precio', sortable: true, render: (v: number) => `$${v}` },
    { key: 'stock' as const, label: 'Stock', sortable: true },
    {
      key: 'id' as const,
      label: 'Acciones',
      render: (value: string) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(products.find((p) => p.id === value))}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Edit2 size={16} className="text-accent" />
          </button>
          <button
            onClick={() => handleDelete(value)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Productos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <DataTable columns={columns} data={products} itemsPerPage={10} />

      <Modal
        open={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
      >
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Categoría</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
