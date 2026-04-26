import { AlertCircle, FileText } from 'lucide-react'

export function ExportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Exportar Datos</h1>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 flex items-start gap-4">
        <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">En Construcción</h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Esta función de exportación a Excel está en desarrollo. Pronto podrás descargar reportes de usuarios y productos en formato Excel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-background border border-border rounded-lg p-6 opacity-50">
          <FileText size={32} className="text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Exportar Usuarios</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Descarga la lista de usuarios en formato Excel
          </p>
          <button disabled className="btn-primary opacity-50 cursor-not-allowed w-full">
            Próximamente
          </button>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 opacity-50">
          <FileText size={32} className="text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Exportar Productos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Descarga la lista de productos en formato Excel
          </p>
          <button disabled className="btn-primary opacity-50 cursor-not-allowed w-full">
            Próximamente
          </button>
        </div>
      </div>
    </div>
  )
}
