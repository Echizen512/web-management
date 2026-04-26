import { DataTable } from '@/components/DataTable'

interface Log {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  status: string
}

const SAMPLE_LOGS: Log[] = [
  { id: '1', timestamp: '01-02-2026 14:30', user: 'Admin', action: 'Crear Usuario', details: 'secretary@system.com', status: 'Exitoso' },
  { id: '2', timestamp: '01-02-2026 14:25', user: 'Admin', action: 'Editar Producto', details: 'Producto A', status: 'Exitoso' },
  { id: '3', timestamp: '01-02-2026 14:20', user: 'Master', action: 'Eliminar Usuario', details: 'user@example.com', status: 'Exitoso' },
  { id: '4', timestamp: '01-02-2026 14:15', user: 'Secretary', action: 'Consultar', details: 'Productos', status: 'Exitoso' },
  { id: '5', timestamp: '01-02-2026 14:10', user: 'Admin', action: 'Crear Producto', details: 'Producto Nuevo', status: 'Exitoso' },
  { id: '6', timestamp: '01-02-2026 14:05', user: 'Master', action: 'Exportar', details: 'Usuarios.xlsx', status: 'Exitoso' },
  { id: '7', timestamp: '01-02-2026 14:00', user: 'Admin', action: 'Login', details: 'admin@system.com', status: 'Exitoso' },
]

export function LogsPage() {
  const columns = [
    { key: 'timestamp' as const, label: 'Fecha', sortable: true },
    { key: 'user' as const, label: 'Usuario', sortable: true },
    { key: 'action' as const, label: 'Acción', sortable: true },
    { key: 'details' as const, label: 'Detalles', sortable: false },
    {
      key: 'status' as const,
      label: 'Estado',
      sortable: true,
      render: (value: string) => (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {value}
        </span>
      ),
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Bitácora del Sistema</h1>

      <div className="bg-background border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Se muestran todos los eventos y actividades del sistema. Útil para auditoría y troubleshooting.
        </p>
      </div>

      <DataTable columns={columns} data={SAMPLE_LOGS} itemsPerPage={10} />
    </div>
  )
}
