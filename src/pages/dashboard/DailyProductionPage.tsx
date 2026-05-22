import { useState, useEffect, useMemo } from 'react'
import { Modal } from '@/components/ui/modal'

import {
    Loader2,
    RefreshCw,
    Box,
    Ruler,
    Save,
    History,
    ClipboardCheck,
    AlertCircle,
    Search,
    CalendarDays,
    Clock3,
    Package2,
    BadgeInfo
} from 'lucide-react'

import {
    getProducts,
    Product
} from '@/api/productService'

import {
    getMeasures,
    Measure
} from '@/api/measureService'

import {
    createDailyProduction,
    getDailyProduction,
    DailyProduction
} from '@/api/dailyProductionService'

import { toast } from 'sonner'

export function DailyProductionPage() {

    const [products, setProducts] =
        useState<Product[]>([])

    const [measures, setMeasures] =
        useState<Measure[]>([])

    const [isLoading, setIsLoading] =
        useState(true)

    const [isSubmitting, setIsSubmitting] =
        useState(false)

    const [isHistoryLoading, setIsHistoryLoading] =
        useState(false)

    const [matrix, setMatrix] =
        useState<Record<string, number>>({})

    const [typeSchedule, setTypeSchedule] =
        useState<"Normal" | "Sobretiempo">("Normal")

    const [observation, setObservation] =
        useState("")

    const [isHistoryModalOpen, setIsHistoryModalOpen] =
        useState(false)

    const [dailyHistory, setDailyHistory] =
        useState<DailyProduction[]>([])

    const [searchHistory, setSearchHistory] =
        useState('')

    const [selectedDate, setSelectedDate] =
        useState(
            new Date().toISOString().split('T')[0]
        )

    const fetchInitialData = async (
        showToast = false
    ) => {

        try {

            setIsLoading(true)

            const loadingToast = showToast
                ? toast.loading(
                    'Actualizando información...'
                )
                : null

            const [prods, meas] = await Promise.all([
                getProducts(),
                getMeasures()
            ])

            setProducts(
                prods.filter((p) => p.status)
            )

            setMeasures(meas)

            if (loadingToast) {

                toast.dismiss(loadingToast)

                toast.success(
                    'Datos actualizados',
                    {
                        description:
                            'La información fue sincronizada correctamente.'
                    }
                )
            }

        } catch (error: any) {

            console.error(
                'Error cargando datos:',
                error
            )

            toast.error(
                'Error cargando datos',
                {
                    description:
                        error?.message ||
                        'No fue posible consultar la información.'
                }
            )

        } finally {

            setIsLoading(false)
        }
    }

    const loadHistoryByDate = async () => {

        try {

            setIsHistoryLoading(true)

            const history =
                await getDailyProduction(
                    selectedDate,
                    selectedDate
                )

            setDailyHistory(history.data || [])

            return history.data || []

        } catch (error: any) {

            console.error(
                'Error cargando historial:',
                error
            )

            toast.error(
                'Error cargando historial',
                {
                    description:
                        error?.message ||
                        'No fue posible obtener los registros.'
                }
            )

            return []

        } finally {

            setIsHistoryLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [])

    const handleInputChange = (
        productId: number,
        measureId: number,
        value: string
    ) => {

        const val = parseInt(value) || 0

        setMatrix((prev) => ({
            ...prev,
            [`${productId}-${measureId}`]: val
        }))
    }

    const handleSubmit = async () => {

        const entries =
            Object.entries(matrix)
                .filter(([_, qty]) => qty > 0)

        if (entries.length === 0) {

            toast.warning(
                'Sin cantidades registradas',
                {
                    description:
                        'Debes ingresar al menos una cantidad mayor a 0.'
                }
            )

            return
        }

        try {

            setIsSubmitting(true)

            const savingToast = toast.loading(
                'Guardando producción...',
                {
                    description:
                        'Registrando producción diaria en el sistema.'
                }
            )

            const promises = entries.map(
                ([key, quantity]) => {

                    const [
                        productID,
                        measureID
                    ] = key
                        .split('-')
                        .map(Number)

                    return createDailyProduction({
                        productID,
                        measureID,
                        quantity,
                        type_schedule: typeSchedule,
                        observation,
                        date: selectedDate
                    })
                }
            )

            await Promise.all(promises)

            toast.dismiss(savingToast)

            toast.success(
                'Producción registrada',
                {
                    description:
                        `${entries.length} registros fueron almacenados correctamente.`
                }
            )

            setMatrix({})
            setObservation("")

        } catch (error: any) {

            console.error(
                'Error guardando producción:',
                error
            )

            toast.error(
                'Error al guardar producción',
                {
                    description:
                        error?.message ||
                        'Ocurrió un error inesperado.'
                }
            )

        } finally {

            setIsSubmitting(false)
        }
    }

    const filteredHistory = useMemo(() => {

        return dailyHistory.filter((item) => {

            const prodName =
                products.find(
                    p => p.productID === item.productID
                )?.name || ""

            const measName =
                measures.find(
                    m => m.measureID === item.measureID
                )?.name || ""

            const typeLabel =
                item.type_schedule?.toUpperCase() === 'MAÑANA'
                    ? 'NORMAL'
                    : item.type_schedule

            const search =
                `${prodName} ${measName} ${typeLabel}`
                    .toLowerCase()

            return search.includes(
                searchHistory.toLowerCase()
            )
        })

    }, [
        dailyHistory,
        searchHistory,
        products,
        measures
    ])

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

                <div>

                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 text-foreground">
                        <ClipboardCheck
                            className="text-primary"
                            size={40}
                        />
                        Producción Diaria
                    </h1>

                    <p className="text-muted-foreground mt-1 text-lg italic">
                        Panel de control de producción y carga dinámica.
                    </p>

                </div>

                <div className="flex items-center gap-3">

                    <button
                        onClick={async () => {

                            const data =
                                await loadHistoryByDate()

                            setIsHistoryModalOpen(true)

                            toast.info(
                                'Historial cargado',
                                {
                                    description:
                                        `Se encontraron ${data.length} registros para la fecha seleccionada.`
                                }
                            )
                        }}
                        className="flex items-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-bold transition-all border border-border"
                    >
                        {
                            isHistoryLoading
                                ? (
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />
                                )
                                : (
                                    <History size={20} />
                                )
                        }

                        Ver Historial
                    </button>

                    <button
                        onClick={() =>
                            fetchInitialData(true)
                        }
                        className="p-3 hover:bg-secondary rounded-xl transition-all border border-border"
                    >
                        <RefreshCw
                            size={20}
                            className={
                                isLoading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                    </button>

                </div>

            </div>

            {isLoading ? (

                <div className="flex flex-col items-center justify-center py-40">

                    <Loader2
                        className="animate-spin text-primary mb-4"
                        size={50}
                    />

                    <p className="text-muted-foreground font-bold animate-pulse">
                        Armando matriz de producción...
                    </p>

                </div>

            ) : (

                <div className="space-y-6">

                    {/* PANEL SUPERIOR */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card p-6 rounded-2xl border border-border shadow-sm">

                        <div className="space-y-2">

                            <label className="text-xs font-black uppercase text-primary flex items-center gap-2">
                                <Clock3 size={14} />
                                Horario
                            </label>

                            <select
                                className="input h-12 w-full font-bold"
                                value={typeSchedule}
                                onChange={(e) =>
                                    setTypeSchedule(
                                        e.target.value as any
                                    )
                                }
                            >
                                <option value="Normal">
                                    Normal
                                </option>
                            </select>

                        </div>

                        <div className="space-y-2">

                            <label className="text-xs font-black uppercase text-primary flex items-center gap-2">
                                <CalendarDays size={14} />
                                Fecha de Producción
                            </label>

                            <input
                                type="date"
                                className="input h-12 w-full font-bold"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="space-y-2">

                            <label className="text-xs font-black uppercase text-primary flex items-center gap-2">
                                <BadgeInfo size={14} />
                                Observaciones Generales
                            </label>

                            <input
                                type="text"
                                className="input h-12 w-full"
                                placeholder="Ej: Retraso por falla eléctrica..."
                                value={observation}
                                onChange={(e) =>
                                    setObservation(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* MATRIZ */}

                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">

                        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">

                            <div>

                                <h2 className="font-black text-lg text-foreground">
                                    Matriz de Producción
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Registra cantidades por producto y medida.
                                </p>

                            </div>

                            <span className="text-xs font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">
                                {products.length} Productos
                            </span>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full border-collapse">

                                <thead>

                                    <tr className="bg-muted/50 border-b border-border">

                                        <th className="px-6 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest sticky left-0 bg-muted/50 z-10">
                                            Producto
                                        </th>

                                        {measures.map((m) => (

                                            <th
                                                key={m.measureID}
                                                className="px-4 py-5 text-center text-xs font-black text-muted-foreground uppercase tracking-widest"
                                            >
                                                {m.name}
                                            </th>

                                        ))}

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-border">

                                    {products.map((p) => (

                                        <tr
                                            key={p.productID}
                                            className="hover:bg-muted/20 transition-colors"
                                        >

                                            <td className="px-6 py-4 sticky left-0 bg-card/95 backdrop-blur-sm z-10 border-r border-border">

                                                <div className="flex items-center gap-3">

                                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                        <Box size={18} />
                                                    </div>

                                                    <span className="font-bold text-sm">
                                                        {p.name}
                                                    </span>

                                                </div>

                                            </td>

                                            {measures.map((m) => (

                                                <td
                                                    key={m.measureID}
                                                    className="px-2 py-2"
                                                >

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        className="w-full h-10 text-center font-bold bg-background rounded-lg border-transparent focus:border-primary focus:bg-background transition-all"
                                                        value={
                                                            matrix[
                                                            `${p.productID}-${m.measureID}`
                                                            ] || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                p.productID,
                                                                m.measureID,
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </td>

                                            ))}

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* BOTÓN */}

                    <div className="flex justify-end pt-4">

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                        >

                            {
                                isSubmitting
                                    ? (
                                        <Loader2 className="animate-spin" />
                                    )
                                    : (
                                        <Save />
                                    )
                            }

                            GUARDAR PRODUCCIÓN DEL DÍA

                        </button>

                    </div>

                </div>

            )}

            {/* MODAL HISTORIAL */}

            <Modal
                open={isHistoryModalOpen}
                onOpenChange={setIsHistoryModalOpen}
            >

                <div className="p-5 max-h-[85vh] overflow-y-auto">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

                        <div>

                            <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                                <History className="text-primary" />
                                Historial del Día
                            </h2>

                            <p className="text-muted-foreground mt-1">
                                Producción registrada para la fecha seleccionada.
                            </p>

                        </div>

                        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-black border border-primary/20">
                            {filteredHistory.length} registros
                        </div>

                    </div>

                    {/* FILTRO */}

                    <div className="relative mb-6">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            type="text"
                            placeholder="Buscar producto, medida o tipo..."
                            value={searchHistory}
                            onChange={(e) =>
                                setSearchHistory(e.target.value)
                            }
                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background focus:border-primary outline-none transition-all font-medium"
                        />

                    </div>

                    {/* LISTADO */}

                    <div className="space-y-4">

                        {filteredHistory.length > 0 ? (

                            filteredHistory.map((item) => {

                                const prodName =
                                    products.find(
                                        p => p.productID === item.productID
                                    )?.name || "Producto"

                                const measName =
                                    measures.find(
                                        m => m.measureID === item.measureID
                                    )?.name || "Medida"

                                const scheduleLabel =
                                    item.type_schedule?.toUpperCase() === 'MAÑANA'
                                        ? 'NORMAL'
                                        : item.type_schedule

                                return (

                                    <div
                                        key={item.daily_productionID}
                                        className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
                                    >

                                        <div className="p-5">

                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                                                <div className="space-y-3">

                                                    <div className="flex items-center gap-3">

                                                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                                            <Package2 size={22} />
                                                        </div>

                                                        <div>

                                                            <h3 className="font-black text-lg text-foreground">
                                                                {prodName}
                                                            </h3>

                                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                                                Registro #{item.daily_productionID}
                                                            </p>

                                                        </div>

                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-bold">
                                                            <Ruler size={12} />
                                                            {measName}
                                                        </span>

                                                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                                                            <Clock3 size={12} />
                                                            {scheduleLabel}
                                                        </span>

                                                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-bold">
                                                            <CalendarDays size={12} />

                                                            {
                                                                item.date
                                                                    ? item.date
                                                                    : '---'
                                                            }

                                                        </span>

                                                    </div>

                                                    {item.observation && (

                                                        <div className="bg-muted/40 border border-border rounded-xl p-3">

                                                            <p className="text-xs font-black uppercase text-muted-foreground mb-1">
                                                                Observación
                                                            </p>

                                                            <p className="text-sm text-foreground font-medium">
                                                                {item.observation}
                                                            </p>

                                                        </div>

                                                    )}

                                                </div>

                                                <div className="min-w-[140px]">

                                                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center">

                                                        <p className="text-xs font-black uppercase text-primary tracking-widest mb-1">
                                                            Producción
                                                        </p>

                                                        <p className="text-4xl font-black text-primary leading-none">
                                                            {item.quantity}
                                                        </p>

                                                        <p className="text-xs text-muted-foreground font-bold uppercase mt-2">
                                                            Unidades
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                )
                            })

                        ) : (

                            <div className="text-center py-16 opacity-60">

                                <AlertCircle
                                    size={50}
                                    className="mx-auto mb-4"
                                />

                                <p className="font-black text-lg">
                                    No se encontraron resultados
                                </p>

                                <p className="text-sm text-muted-foreground mt-1">
                                    Intenta modificar el filtro de búsqueda.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </Modal>

        </div>
    )
}