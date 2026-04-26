import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const SALES_DATA = [
  { month: 'Ene', sales: 4000, revenue: 2400 },
  { month: 'Feb', sales: 3000, revenue: 1398 },
  { month: 'Mar', sales: 2000, revenue: 9800 },
  { month: 'Abr', sales: 2780, revenue: 3908 },
  { month: 'May', sales: 1890, revenue: 4800 },
  { month: 'Jun', sales: 2390, revenue: 3800 },
]

const CATEGORY_DATA = [
  { name: 'Electrónica', value: 35 },
  { name: 'Hogar', value: 25 },
  { name: 'Accesorios', value: 40 },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B']

export function ChartsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Gráficas y Análisis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Ventas Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={SALES_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }} />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" name="Ventas" />
              <Bar dataKey="revenue" fill="#10B981" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Tendencia de Ingresos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={SALES_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Ingresos" />
            <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} name="Ventas" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
