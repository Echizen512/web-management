import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { ThemeProvider } from './context/ThemeContext'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return user ? <>{children}</> : <Navigate replace to="/" />
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter> 
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route 
              path="/dashboard/*" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}