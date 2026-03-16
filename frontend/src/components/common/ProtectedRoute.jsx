import { Navigate } from 'react-router-dom'
import { useAuth } from '../../constants/AuthContext'

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='w-8 h-8 border-4 border-[#dc2626] border-t-transparent rounded-full animate-spin' />
        </div>
    )
    if (!user) return <Navigate to="/login" replace />
    return children
}

export const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth()
    if (loading) return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='w-8 h-8 border-4 border-[#dc2626] border-t-transparent rounded-full animate-spin' />
        </div>
    )
    if (!user) return <Navigate to="/login" replace />
    if (!isAdmin) return <Navigate to="/staff/dashboard" replace />
    return children
}