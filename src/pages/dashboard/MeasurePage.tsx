import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  Ruler,
  Ghost,
  Calendar
} from 'lucide-react'

import {
  getMeasures,
  createMeasure,
  updateMeasure,
  deleteMeasure
} from '@/api/measureService'

import { toast } from 'sonner'

interface Measure {
  measureID: number;
  name: string;
  date: string;
}

export function MeasuresPage() {

  const [measures, setMeasures] = useState<Measure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: ''
  })

  const formatTableDate = (dateStr: string) => {

    if (!dateStr) return '---'

    const d = new Date(dateStr)

    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()

    return `${day}/${month}/${year}`
  }

  const loadMeasures = async (showToast = false) => {

    try {

      setIsLoading(true)

      const response: any = await getMeasures()

      const dataList = Array.isArray(response)
        ? response
        : (response?.measures || [])

      setMeasures(dataList)

      if (showToast) {

        toast.success('Medidas actualizadas', {
          description: `Se encontraron ${dataList.length} medidas registradas.`
        })
      }

    } catch (error: any) {

      console.error("Error al cargar medidas:", error)

      setMeasures([])

      toast.error('Error al cargar medidas', {
        description: error?.message || 'No fue posible consultar la información.'
      })

    } finally {

      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMeasures()
  }, [])

  const handleOpenModal = (measure?: Measure) => {

    if (measure) {

      setEditingId(measure.measureID)

      setFormData({
        name: measure.name
      })

      toast.info('Modo edición activado', {
        description: `Editando la medida "${measure.name}".`
      })

    } else {

      setEditingId(null)

      setFormData({
        name: ''
      })

      toast.info('Nueva medida', {
        description: 'Completa el formulario para registrar una medida.'
      })
    }

    setIsModalOpen(true)
  }

  const handleCloseModal = () => {

    setIsModalOpen(false)

    toast('Formulario cerrado', {
      description: 'No se realizaron cambios.'
    })
  }

  const handleDelete = async (id: number, name: string) => {

    toast.warning('Confirmación requerida', {
      description: `Estás a punto de eliminar "${name}".`
    })

    if (confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) {

      const deletingToast = toast.loading('Eliminando medida...', {
        description: `Procesando eliminación de "${name}".`
      })

      try {

        await deleteMeasure(id)

        await loadMeasures()

        toast.dismiss(deletingToast)

        toast.success('Medida eliminada exitosamente', {
          description: `"${name}" fue eliminada del sistema.`
        })

      } catch (error: any) {

        toast.dismiss(deletingToast)

        toast.error('Error al eliminar medida', {
          description: error?.message || 'No fue posible eliminar el registro.'
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    try {

      setIsSaving(true)

      const payload = {
        ...formData,
        date: new Date().toISOString()
      }

      const savingToast = toast.loading(
        editingId
          ? 'Actualizando medida...'
          : 'Registrando medida...',
        {
          description: editingId
            ? 'Guardando cambios en la base de datos.'
            : 'Creando nuevo registro.'
        }
      )

      if (editingId) {

        await updateMeasure(editingId, payload)

        toast.dismiss(savingToast)

        toast.success('Medida actualizada', {
          description: `Los cambios de "${formData.name}" fueron guardados correctamente.`
        })

      } else {

        await createMeasure(payload)

        toast.dismiss(savingToast)

        toast.success('Medida registrada', {
          description: `"${formData.name}" fue añadida exitosamente.`
        })
      }

      setIsModalOpen(false)

      await loadMeasures()

    } catch (error: any) {

      toast.error('Error al guardar medida', {
        description: error?.message || 'Ocurrió un error inesperado.'
      })

    } finally {

      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Medidas
          </h1>

          <p className="text-muted-foreground mt-1 text-lg">
            Configura las dimensiones disponibles para los productos.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => loadMeasures(true)}
            className="p-3 hover:bg-secondary rounded-xl transition-all border border-border shadow-sm active:scale-95"
          >
            <RefreshCw
              size={20}
              className={isLoading ? "animate-spin text-primary" : ""}
            />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Nueva Medida
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2
              className="animate-spin text-primary mb-4"
              size={48}
            />
            <p className="text-muted-foreground font-medium animate-pulse">
              Consultando base de datos...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    ID
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Nombre
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Fecha (D/M/A)
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-right text-muted-foreground uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {measures.length > 0 ? (
                  measures.map((m) => (
                    <tr
                      key={m.measureID}
                      className="hover:bg-muted/40 transition-colors"
                    >

                      <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                        #{m.measureID}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">

                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Ruler size={20} />
                          </div>

                          <span className="font-bold text-base">
                            {m.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar size={14} />
                          {formatTableDate(m.date)}
                        </div>

                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(m)}
                            className="p-2 border border-border hover:text-blue-500 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(m.measureID, m.name)}
                            className="p-2 border border-border hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-20 text-center text-muted-foreground opacity-50"
                    >
                      <Ghost size={48} className="mx-auto mb-2" />
                      <p>No se encontraron medidas</p>
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
            <h2 className="text-2xl font-black">
              {editingId
                ? 'Editar Medida'
                : 'Nueva Medida'
              }
            </h2>
            <p className="text-muted-foreground text-sm">
              Introduce el nombre. La fecha de hoy se asignará automáticamente.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                Nombre
              </label>
              <input
                type="text"
                className="input h-11"
                value={formData.name}
                onChange={e =>
                  setFormData({
                    name: e.target.value
                  })
                }
                required
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-4">

              <button
                type="submit"
                disabled={isSaving}
                className="flex-[2] btn-primary h-12 uppercase font-black disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Procesando...
                  </span>
                ) : (
                  editingId
                    ? 'Actualizar'
                    : 'Guardar'
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 btn-secondary h-12 font-bold"
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}