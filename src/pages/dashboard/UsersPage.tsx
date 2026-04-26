import { useState } from 'react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2 } from 'lucide-react'

interface User {
  id: string
  email: string
  role: string
  name: string
  createdAt: string
}

const INITIAL_USERS: User[] = [
  { id: '1', email: 'admin@system.com', role: 'admin', name: 'Administrador', createdAt: '2024-01-15' },
  { id: '2', email: 'secretary@system.com', role: 'secretary', name: 'Secretaria', createdAt: '2024-01-16' },
  { id: '3', email: 'master@system.com', role: 'master', name: 'Master', createdAt: '2024-01-17' },
]

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ email: '', name: '', role: 'secretary' })

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingId(user.id)
      setFormData({ email: user.email, name: user.name, role: user.role })
    } else {
      setEditingId(null)
      setFormData({ email: '', name: '', role: 'secretary' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...formData } : u)))
    } else {
      setUsers([
        ...users,
        {
          id: String(Date.now()),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  const columns = [
    { key: 'email' as const, label: 'Email', sortable: true },
    { key: 'name' as const, label: 'Nombre', sortable: true },
    { key: 'role' as const, label: 'Rol', sortable: true },
    { key: 'createdAt' as const, label: 'Creado', sortable: true },
    {
      key: 'id' as const,
      label: 'Acciones',
      render: (value: string) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(users.find((u) => u.id === value))}
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
        <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <DataTable columns={columns} data={users} itemsPerPage={10} />

      <Modal
        open={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
      >
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
          </div>
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
            <label className="block text-sm font-medium text-foreground mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input"
            >
              <option value="secretary">Secretaria</option>
              <option value="admin">Admin</option>
              <option value="master">Master</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
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
