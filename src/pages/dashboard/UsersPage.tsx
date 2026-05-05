import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2, Loader2, RefreshCw, User as UserIcon, ShieldCheck, UserCog, Ghost } from 'lucide-react'
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

  // Helper para renderizar el Badge del Rol
  const RoleBadge = ({ role }: { role: string }) => {
    const roles: Record<string, { label: string; class: string; icon: any }> = {
      master: { 
        label: 'Master', 
        class: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
        icon: <ShieldCheck size={12} />
      },
      admin: { 
        label: 'Admin', 
        class: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        icon: <UserCog size={12} />
      },
      empleado: { 
        label: 'Empleado', 
        class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
        icon: <UserIcon size={12} />
      }
    }

    const config = roles[role?.toLowerCase()] || roles['empleado']

    return (
      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

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
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Usuarios</h1>
          <p className="text-muted-foreground mt-1 text-lg">Gestiona accesos y permisos del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadUsers} 
            className="p-3 text-foreground hover:bg-secondary rounded-xl transition-all border border-border shadow-sm active:scale-95"
            title="Refrescar"
          >
            <RefreshCw size={20} className={`${isLoading ? "animate-spin text-primary" : "text-foreground"}`} />
          </button>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Contenedor de Tabla */}
      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-muted-foreground font-medium animate-pulse">Cargando base de datos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Información de Usuario</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Rol de Acceso</th>
                  <th className="px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest">Fecha de Alta</th>
                  <th className="px-6 py-5 text-xs font-bold text-right text-muted-foreground uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.userID} className="hover:bg-muted/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                            <UserIcon size={22} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-base leading-tight">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {u.date ? new Date(u.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(u)}
                            className="p-2.5 bg-background border border-border hover:border-blue-500 hover:text-blue-500 rounded-lg transition-all shadow-sm text-foreground"
                            title="Editar usuario"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.userID)}
                            className="p-2.5 bg-background border border-border hover:border-red-500 hover:text-red-600 rounded-lg transition-all shadow-sm text-foreground"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Ghost size={40} strokeWidth={1.5} />
                        <p className="text-lg font-medium">No hay usuarios en el sistema</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

  {/* Modal con inputs más estilizados */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground">{editingId ? 'Editar Colaborador' : 'Crear Cuenta'}</h2>
            <p className="text-muted-foreground">Define los permisos y credenciales del usuario.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nombre Completo</label>
                    <input 
                        type="text" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground outline-none focus:border-primary transition-all font-medium" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Correo Electrónico</label>
                    <input 
                        type="email" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground outline-none focus:border-primary transition-all font-medium" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Rol de Usuario</label>
                    <select 
                        className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground outline-none focus:border-primary transition-all font-bold appearance-none"
                        value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                        <option value="empleado">Empleado</option>
                        <option value="admin">Administrador</option>
                        <option value="master">Master</option>
                    </select>
                </div>
                {!editingId && (
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Contraseña Inicial</label>
                    <input 
                        type="password" className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground outline-none focus:border-primary transition-all font-medium" 
                        placeholder="Mín. 6 caracteres"
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
                    />
                </div>
                )}
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-[2] bg-primary text-primary-foreground h-12 rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                {editingId ? 'ACTUALIZAR DATOS' : 'CREAR USUARIO'}
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