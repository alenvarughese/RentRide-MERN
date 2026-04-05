import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-heading tracking-widest uppercase text-dark-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (user && user.role === 'admin') {
    return <Outlet />
  }

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}
