import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2, Loader2, RefreshCw, Ghost, Calendar, Hash, AlertTriangle } from 'lucide-react'
import {
    getRejectProducts,
    createRejectProduct,
    updateRejectProduct,
    deleteRejectProduct,
    RejectProduct
} from '@/api/rejectProductService'

export function RejectProductsPage() {
    const [rejects, setRejects] = useState<RejectProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)

    const [dateFilter, setDateFilter] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    const [formData, setFormData] = useState({
        quantity: 0,
        date: new Date().toISOString().split('T')[0]
    })

    const formatTableDate = (dateStr: string) => {
        if (!dateStr) return '---';
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const loadRejects = async () => {
        try {
            setIsLoading(true)
            const response: any = await getRejectProducts(dateFilter.startDate, dateFilter.endDate)
            // Corrección para los errores de las capturas (ts2339)
            const dataList = Array.isArray(response) ? response : (response?.data || [])
            setRejects(dataList)
        } catch (error: any) {
            console.error("Error al cargar rechazos:", error)
            setRejects([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadRejects()
    }, [dateFilter])

    const handleOpenModal = (item?: RejectProduct) => {
        if (item) {
            setEditingId(item.reject_productID)
            setFormData({
                quantity: item.quantity,
                date: item.date.split('T')[0]
            })
        } else {
            setEditingId(null)
            setFormData({
                quantity: 0,
                date: new Date().toISOString().split('T')[0]
            })
        }
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm(`¿Estás seguro de que deseas eliminar este registro de rechazo?`)) {
            try {
                await deleteRejectProduct(id)
                await loadRejects()
            } catch (error: any) {
                alert(`Error al eliminar: ${error.message}`)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingId) {
                await updateRejectProduct(editingId, { quantity: Number(formData.quantity) })
            } else {
                await createRejectProduct({ quantity: Number(formData.quantity) })
            }
            setIsModalOpen(false)
            await loadRejects()
        } catch (error: any) {
            alert(`Error al guardar: ${error.message}`)
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-foreground">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Productos Rechazados</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Control de mermas y productos no conformes.</p>
                </div>

                {/* Contenedor de acciones optimizado (sin espacios sobrantes) */}
                <div className="flex items-center gap-2 ml-auto lg:ml-0">
                    <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-xl shadow-sm">
                        <input
                            type="date"
                            className="bg-transparent border-none text-xs md:text-sm font-bold focus:ring-0 py-1 px-2"
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                        />
                        <span className="text-muted-foreground font-bold text-xs">al</span>
                        <input
                            type="date"
                            className="bg-transparent border-none text-xs md:text-sm font-bold focus:ring-0 py-1 px-2"
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={loadRejects}
                        className="p-3 hover:bg-secondary rounded-xl transition-all border border-border shadow-sm active:scale-95"
                        title="Refrescar"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin text-primary" : ""} />
                    </button>
                    
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-destructive text-destructive-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={20} strokeWidth={3} /> Registrar Rechazo
                    </button>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="animate-spin text-primary mb-4" size={48} />
                        <p className="text-muted-foreground font-medium animate-pulse">Consultando mermas...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Cantidad</th>
                                    <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Fecha de Registro</th>
                                    <th className="px-6 py-5 text-xs font-bold text-right text-muted-foreground uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rejects.length > 0 ? (
                                    rejects.map((r) => (
                                        <tr key={r.reject_productID} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-muted-foreground">#{r.reject_productID}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 border border-red-500/20">
                                                        <AlertTriangle size={20} />
                                                    </div>
                                                    <span className="font-black text-xl">{r.quantity}</span>
                                                    <span className="text-muted-foreground text-sm font-medium uppercase tracking-tighter">Unidades</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold">
                                                    <Calendar size={14} />
                                                    {formatTableDate(r.date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(r)} className="p-2 border border-border hover:border-blue-500 hover:text-blue-500 rounded-lg transition-all active:scale-90"><Edit2 size={18} /></button>
                                                    <button onClick={() => handleDelete(r.reject_productID)} className="p-2 border border-border hover:border-red-500 hover:text-red-600 rounded-lg transition-all active:scale-90"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground opacity-50">
                                            <Ghost size={48} className="mx-auto mb-2" />
                                            <p className="text-lg font-medium">No hay registros de rechazo en este rango</p>
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
                        <h2 className="text-2xl font-black">{editingId ? 'Editar Registro' : 'Nuevo Rechazo'}</h2>
                        <p className="text-muted-foreground text-sm">Indica la cantidad de productos que no pasaron el control.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1">
                                <Hash size={12} /> Cantidad
                            </label>
                            <input
                                type="number"
                                className="input h-12 text-2xl font-black focus:ring-destructive/20 focus:border-destructive"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                required
                                min="1"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1">
                                <Calendar size={12} /> Fecha del Suceso
                            </label>
                            <input
                                type="date"
                                className="input h-11 font-bold"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="flex-[2] btn-primary bg-destructive text-destructive-foreground h-12 uppercase font-black tracking-widest hover:opacity-90 shadow-lg">
                                {editingId ? 'Actualizar' : 'Confirmar Rechazo'}
                            </button>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary h-12 font-bold">Cancelar</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}