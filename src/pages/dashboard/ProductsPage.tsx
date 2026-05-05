import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2, Loader2, RefreshCw, Box, Tag, Layers, Ghost } from 'lucide-react'
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/api/productService'

interface Product {
  productID: number;
  name: string;
  type: string;
  price: number;
  stock: number;
}

export function ProductsPage() {
  // --- ESTADOS ---
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({ 
    name: '', 
    type: '', 
    price: 0, 
    stock: 0 
  })

  // --- LÓGICA DE CARGA ---
  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error: any) {
      console.error("Error al cargar productos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // --- MANEJADORES DE ACCIONES ---
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.productID)
      setFormData({ 
        name: product.name, 
        type: product.type, 
        price: product.price, 
        stock: product.stock 
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', type: '', price: 0, stock: 0 })
    }
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) {
      try {
        await deleteProduct(id)
        await loadProducts() // Recargar lista tras eliminar
      } catch (error: any) {
        alert(`Error al eliminar: ${error.message}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateProduct(editingId, formData)
      } else {
        await createProduct(formData)
      }
      setIsModalOpen(false)
      await loadProducts() 
    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-foreground">
      {/* Header Sección */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-1 text-lg">Gestiona el catálogo de colchones y productos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadProducts} 
            className="p-3 hover:bg-secondary rounded-xl transition-all border border-border shadow-sm active:scale-95"
            title="Refrescar datos"
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

      {/* Contenedor de Tabla */}
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
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Precio</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-5 text-xs font-bold text-right text-muted-foreground uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.productID} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Box size={20} />
                          </div>
                          <span className="font-bold text-base">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary border border-border w-fit">
                          <Tag size={12} />
                          {p.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-base font-bold text-foreground">
                          ${Number(p.price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Layers size={16} className={p.stock < 5 ? "text-red-500" : "text-muted-foreground"} />
                          <span className={`font-bold ${p.stock < 5 ? "text-red-500" : ""}`}>
                            {p.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(p)}
                            className="p-2 bg-background border border-border hover:border-blue-500 hover:text-blue-500 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.productID, p.name)}
                            className="p-2 bg-background border border-border hover:border-red-500 hover:text-red-600 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground opacity-50">
                        <Ghost size={48} />
                        <p className="text-lg font-medium">No se encontraron productos</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="p-2">
          <div className="mb-6">
            <h2 className="text-2xl font-black">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <p className="text-muted-foreground text-sm">Completa la información del inventario.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground ml-1">Nombre</label>
                <input 
                    type="text" className="input h-11" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground ml-1">Tipo</label>
                <input 
                    type="text" className="input h-11" 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground ml-1">Precio ($)</label>
                    <input 
                        type="number" step="0.01" className="input h-11 font-bold" 
                        value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground ml-1">Stock</label>
                    <input 
                        type="number" className="input h-11 font-bold" 
                        value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required 
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-[2] btn-primary h-12 uppercase font-black tracking-widest">
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary h-12 font-bold">
                Cerrar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}