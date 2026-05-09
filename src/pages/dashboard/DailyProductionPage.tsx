import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import {
    Plus, Loader2, RefreshCw, Box, Ruler, Save,
    History, ChevronRight, ClipboardCheck, AlertCircle
} from 'lucide-react'
import { getProducts, Product } from '@/api/productService'
import { getMeasures, Measure } from '@/api/measureService'
import { createDailyProduction, getDailyProduction, DailyProduction } from '@/api/dailyProductionService'

export function DailyProductionPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [measures, setMeasures] = useState<Measure[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Estado para el formulario dinámico: { "prodID-measID": cantidad }
    const [matrix, setMatrix] = useState<Record<string, number>>({})
    const [typeSchedule, setTypeSchedule] = useState<"Normal" | "Sobretiempo">("Normal")
    const [observation, setObservation] = useState("")

    // Para ver el historial del día
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [dailyHistory, setDailyHistory] = useState<DailyProduction[]>([])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [prods, meas] = await Promise.all([getProducts(), getMeasures()])
            setProducts(prods.filter(p => p.status)) // Solo productos activos
            setMeasures(meas)

            // Cargar historial de hoy por defecto
            const hoy = new Date().toISOString().split('T')[0]
            const history = await getDailyProduction(hoy, hoy)
            setDailyHistory(history.data)
        } catch (error) {
            console.error("Error cargando datos:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleInputChange = (productId: number, measureId: number, value: string) => {
        const val = parseInt(value) || 0
        setMatrix(prev => ({
            ...prev,
            [`${productId}-${measureId}`]: val
        }))
    }

    const handleSubmit = async () => {
        const entries = Object.entries(matrix).filter(([_, qty]) => qty > 0)

        if (entries.length === 0) {
            alert("Introduce al menos una cantidad mayor a 0")
            return
        }

        try {
            setIsSubmitting(true)
            const date = new Date().toISOString()

            // Enviamos cada registro a la API
            const promises = entries.map(([key, quantity]) => {
                const [productID, measureID] = key.split('-').map(Number)
                return createDailyProduction({
                    productID,
                    measureID,
                    quantity,
                    type_schedule: typeSchedule,
                    observation,
                    date
                })
            })

            await Promise.all(promises)
            alert("¡Producción guardada con éxito!")
            setMatrix({}) // Limpiar
            setObservation("")
            fetchData() // Recargar historial
        } catch (error: any) {
            alert("Error al guardar: " + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <ClipboardCheck className="text-primary" size={40} />
                        Producción Diaria
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg italic">Panel de control de carga dinámica.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-bold transition-all border border-border"
                    >
                        <History size={20} /> Ver Historial Hoy
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-3 hover:bg-secondary rounded-xl transition-all border border-border"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="animate-spin text-primary mb-4" size={50} />
                    <p className="text-muted-foreground font-bold animate-pulse">Armando matriz de producción...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* CONFIGURACIÓN GENERAL */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-primary">Horario</label>
                            <select
                                className="input h-12 w-full font-bold"
                                value={typeSchedule}
                                onChange={(e) => setTypeSchedule(e.target.value as any)}
                            >
                                <option value="Normal">Normal</option>
                                <option value="Sobretiempo">Sobretiempo</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black uppercase text-primary">Observaciones Generales</label>
                            <input
                                type="text"
                                className="input h-12 w-full"
                                placeholder="Ej: Retraso por falla eléctrica..."
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* FORMULARIO DINÁMICO */}
                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="px-6 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest sticky left-0 bg-muted/50 z-10">Producto</th>
                                        {measures.map(m => (
                                            <th key={m.measureID} className="px-4 py-5 text-center text-xs font-black text-muted-foreground uppercase tracking-widest">
                                                {m.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {products.map(p => (
                                        <tr key={p.productID} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4 sticky left-0 bg-card/95 backdrop-blur-sm z-10 border-r border-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                        <Box size={18} />
                                                    </div>
                                                    <span className="font-bold text-sm">{p.name}</span>
                                                </div>
                                            </td>
                                            {measures.map(m => (
                                                <td key={m.measureID} className="px-2 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        className="w-full h-10 text-center font-bold bg-background rounded-lg border-transparent focus:border-primary focus:bg-background transition-all"
                                                        value={matrix[`${p.productID}-${m.measureID}`] || ""}
                                                        onChange={(e) => handleInputChange(p.productID, m.measureID, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FOOTER DE ACCIÓN */}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                            GUARDAR PRODUCCIÓN DEL DÍA
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL DE HISTORIAL (Lo que pediste de organizar la info) */}
            <Modal open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black">Registros de Hoy</h2>
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
                            {dailyHistory.length} registros encontrados
                        </span>
                    </div>

                    <div className="space-y-3">
                        {dailyHistory.length > 0 ? (
                            dailyHistory.map((item) => {
                                const prodName = products.find(p => p.productID === item.productID)?.name || "Producto";
                                const measName = measures.find(m => m.measureID === item.measureID)?.name || "Medida";

                                return (
                                    <div key={item.daily_productionID} className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border">
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm">
                                                <p className="font-black">{prodName}</p>
                                                <p className="text-muted-foreground text-xs flex items-center gap-1">
                                                    <Ruler size={12} /> {measName} | <span className="text-primary">{item.type_schedule}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-primary">{item.quantity}</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Unidades</p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-10 opacity-30">
                                <AlertCircle size={40} className="mx-auto mb-2" />
                                <p className="font-bold">No hay producción cargada hoy</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}