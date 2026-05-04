import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2, Loader2, RefreshCw, User as UserIcon } from 'lucide-react'
import { getUsers, registerUser, deleteUser, updateUser } from '@/api/userService'

interface User {
  userID: number;
  email: string;
  role: string;
  name: string;
  date: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
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
    } catch (error: any) {
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
      setEditingId(user.userID)
      setFormData({ 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        password: '' 
      })
    } else {
      setEditingId(null)
      setFormData({ email: '', name: '', role: 'empleado', password: '' })
    }
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await deleteUser(id)
      loadUsers()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateUser(editingId, {
          email: formData.email,
          name: formData.name,
          role: formData.role
        })
      } else {
        await registerUser({
          ...formData,
          password: formData.password || '123456'
        })
      }
      setIsModalOpen(false)
      loadUsers() 
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los accesos y roles de la plataforma.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadUsers} 
            className="p-2.5 hover:bg-secondary rounded-xl transition-all border border-border"
            title="Refrescar"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <Plus size={20} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Contenedor de Tabla */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <p className="text-muted-foreground animate-pulse">Sincronizando datos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Registro</th>
                  <th className="px-6 py-4 text-sm font-semibold text-right text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.userID} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <UserIcon size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          u.role === 'master' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                          u.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {u.date ? new Date(u.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(u)}
                            className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors text-muted-foreground"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.userID)}
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-muted-foreground"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - El contenido del form se mantiene igual */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="p-2">
          <h2 className="text-xl font-bold mb-1">{editingId ? 'Editar Usuario' : 'Nuevo Registro'}</h2>
          <p className="text-sm text-muted-foreground mb-6">Completa los datos del colaborador.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nombre</label>
              <input 
                type="text" className="w-full h-11 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input 
                type="email" className="w-full h-11 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
              />
            </div>
            {!editingId && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Contraseña</label>
                <input 
                  type="password" className="w-full h-11 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Rol</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
                <option value="master">Master</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-primary text-primary-foreground h-11 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
                {editingId ? 'Guardar Cambios' : 'Registrar'}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-secondary text-secondary-foreground h-11 rounded-xl font-bold hover:bg-secondary/80 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}