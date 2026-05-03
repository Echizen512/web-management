import { useState, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { getUsers, registerUser } from '@/api/userService'

interface User {
  id: string
  email: string
  role: string
  name: string
  createdAt: string
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ 
    email: '', 
    name: '', 
    role: 'empleado', 
    password: '' 
  })

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingId(user.id)
      setFormData({ email: user.email, name: user.name, role: user.role, password: '' })
    } else {
      setEditingId(null)
      setFormData({ email: '', name: '', role: 'empleado', password: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        console.log("Lógica de edición pendiente para ID:", editingId)
      } else {
        // Enviar como JSON y esperar respuesta exitosa
        await registerUser({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          password: formData.password || '123456'
        })
        alert('¡Usuario creado con éxito!')
      }
      
      setIsModalOpen(false)
      loadUsers() 
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const columns = [
    { key: 'name' as const, label: 'Nombre', sortable: true },
    { key: 'email' as const, label: 'Email', sortable: true },
    { key: 'role' as const, label: 'Rol', sortable: true },
    { 
      key: 'createdAt' as const, 
      label: 'Fecha Registro', 
      render: (val: string) => val ? new Date(val).toLocaleDateString() : 'N/A' 
    },
    {
      key: 'id' as const,
      label: 'Acciones',
      render: (value: string) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(users.find(u => u.id === value))} className="p-1 hover:bg-muted rounded">
            <Edit2 size={16} className="text-accent" />
          </button>
          <button onClick={() => console.log("Eliminar:", value)} className="p-1 hover:bg-muted rounded">
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">Administra los accesos al sistema</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadUsers} className="p-2 hover:bg-muted rounded-full">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={48} />
        </div>
      ) : (
        <DataTable columns={columns} data={users} itemsPerPage={10} />
      )}

      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? 'Actualizar Información' : 'Registrar Nuevo Usuario'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nombre Completo" 
            className="input" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="input" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          {!editingId && (
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="input" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
          )}
          <select className="input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="empleado">Empleado</option>
            <option value="admin">Administrador</option>
            <option value="master">Master</option>
          </select>
          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn-primary flex-1">Confirmar</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}