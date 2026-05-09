import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2, Loader2, RefreshCw, Box, Tag, Ghost, Calendar, Activity } from 'lucide-react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/api/productService'

// Definimos la interfaz con status booleano (o numérico para compatibilidad con DB)
interface Product {
  productID: number;
  name: string;
  category: string;
  status: boolean | number;
  date: string;
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'true',
    date: new Date().toISOString().split('T')[0]
  })

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const response: any = await getProducts()

      const list = Array.isArray(response)
        ? response
        : (response?.products || [])

      setProducts(list)
    } catch (error: any) {
      console.error("Error al cargar productos:", error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.productID)
      setFormData({
        name: product.name || '',
        category: product.category || '',
        status: String(product.status),
        date: product.date ? product.date.split('T')[0] : ''
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        category: '',
        status: 'true',
        date: new Date().toISOString().split('T')[0]
      })
    }
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) {
      try {
        await deleteProduct(id)
        await loadProducts()
      } catch (error: any) {
        alert(`Error al eliminar: ${error.message}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        status: formData.status === 'true'
      }

      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }
      setIsModalOpen(false)
      await loadProducts()
    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-1 text-lg">Gestiona el catálogo de productos y categorías.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="p-3 hover:bg-secondary rounded-xl transition-all border border-border shadow-sm active:scale-95"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin text-primary" : ""} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-muted-foreground font-medium animate-pulse">Consultando base de datos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">ID</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Nombre</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Categoría</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Fecha</th>
                  <th className="px-6 py-5 text-xs font-bold text-right text-muted-foreground uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length > 0 ? (
                  products.map((p) => {
                    const isActive = p.status === true || p.status === 1;

                    return (
                      <tr key={p.productID} className="hover:bg-muted/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-muted-foreground">#{p.productID}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Box size={20} />
                            </div>
                            <span className="font-bold text-base">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary border border-border w-fit">
                            <Tag size={12} /> {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit border ${isActive
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-red-500/10 text-red-600 border-red-500/20'
                            }`}>
                            <Activity size={12} />
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {p.date
                              ? p.date.split('T')[0].split('-').reverse().join('/')
                              : '---'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenModal(p)} className="p-2 hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(p.productID, p.name)} className="p-2 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground opacity-50">
                      <Ghost size={48} className="mx-auto mb-2" />
                      <p>No se encontraron productos</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="p-2">
          <div className="mb-6">
            <h2 className="text-2xl font-black">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <p className="text-muted-foreground text-sm">Completa los campos requeridos.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nombre</label>
              <input type="text" className="input h-11" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Categoría</label>
              <input type="text" className="input h-11" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Estado</label>
                <select
                  className="input h-11 font-bold"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Fecha</label>
                <input type="date" className="input h-11 font-bold" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-[2] btn-primary h-12 uppercase font-black">
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary h-12 font-bold">Cerrar</button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}