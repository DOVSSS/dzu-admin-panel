import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth()

  if (isLoading) return <div>Загрузка...</div>
  if (!token) return <Navigate to="/login" replace />

  return <>{children}</>
}