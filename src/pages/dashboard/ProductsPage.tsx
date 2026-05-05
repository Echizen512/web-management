import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2, Loader2, RefreshCw, Box, Tag, Layers, Ghost } from 'lucide-react'
import { getProducts, createProduct } from '@/api/productService'

interface Product {
  productID: number;
  name: string;
  type: string;
  price: number;
  stock: number;
}

export function ProductsPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        // La API actualmente no tiene PUT /product en la documentación proporcionada
        alert("Función de actualización no disponible en la API actual")
      } else {
        await createProduct(formData)
      }
      setIsModalOpen(false)
      loadProducts() 
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Inventario</h1>
          <p className="text-muted-foreground mt-1 text-lg">Control de stock y catálogo de productos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadProducts} 
            className="p-3 text-foreground hover:bg-secondary rounded-xl transition-all border border-border shadow-sm active:scale-95"
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

      {/* Tabla de Productos */}
      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-muted-foreground font-medium animate-pulse">Consultando inventario...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Categoría / Tipo</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Precio</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-5 text-xs font-bold text-right text-muted-foreground uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.productID} className="hover:bg-muted/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/20">
                            <Box size={22} />
                          </div>
                          <p className="font-bold text-foreground text-base leading-tight">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 w-fit">
                          <Tag size={12} />
                          {p.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-base font-bold text-foreground">${p.price.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Layers size={16} className={p.stock < 5 ? "text-red-500" : "text-muted-foreground"} />
                          <span className={`font-bold ${p.stock < 5 ? "text-red-500" : "text-foreground"}`}>
                            {p.stock} <span className="text-xs font-medium text-muted-foreground ml-1 text-opacity-50">uds</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(p)}
                            className="p-2.5 bg-background border border-border text-foreground hover:border-blue-500 hover:text-blue-500 rounded-lg transition-all shadow-sm"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className="p-2.5 bg-background border border-border text-foreground hover:border-red-500 hover:text-red-600 rounded-lg transition-all shadow-sm"
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
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Ghost size={40} strokeWidth={1.5} />
                        <p className="text-lg font-medium">No hay productos registrados</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Producto */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <p className="text-muted-foreground">Ingresa los detalles técnicos y comerciales.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nombre del Producto</label>
                <input 
                    type="text" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground outline-none focus:border-primary transition-all font-medium" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Tipo / Categoría</label>
                    <input 
                        type="text" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground outline-none focus:border-primary transition-all font-medium" 
                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required 
                        placeholder="Ej. Colchón, Almohada..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Precio ($)</label>
                        <input 
                            type="number" step="0.01" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground outline-none focus:border-primary transition-all font-bold" 
                            value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Stock inicial</label>
                        <input 
                            type="number" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground outline-none focus:border-primary transition-all font-bold" 
                            value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required 
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-[2] bg-primary text-primary-foreground h-12 rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase">
                {editingId ? 'Guardar Cambios' : 'Registrar Producto'}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-secondary text-secondary-foreground h-12 rounded-xl font-bold hover:bg-secondary/80 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}