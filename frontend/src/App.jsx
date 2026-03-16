import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider } from './constants/AuthContext';

import Homepage from './components/HomePage/Homepage';
import NavBar from './components/NavSec/NavBar';
import StaffSignUp from './components/SignUp/StaffSignUp';
import LoginForm from './components/SignIn/LoginForm';
import SetupPage from './components/AdminSetup/SetupPage';
import CreateShipmentForm from './components/ShipMent/CreateShipmentForm';
import EditShipmentFinancials from './components/ShipMent/EditShipmentFinancials';
import NotFound from './components/common/NotFound';
import ScrollToTop from './components/common/ScrollToTop';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import api from './api/axios';

const AppRoutes = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const checkAndClear = async () => {
            try {
                const res = await api.get("/auth/setup/status/")
                if (!res.data.setup_complete) {
                    localStorage.clear()
                    navigate('/setup')
                }
            } catch {}
        }
        checkAndClear()
    }, [])

    return (
        <div className='max-w-7xl mx-auto' style={{ colorScheme: 'light' }}>
            <ScrollToTop />
            <NavBar />
            <Routes>
                <Route path='/' element={<Homepage />} />
                <Route path='/setup' element={<SetupPage />} />
                <Route path='/register' element={<StaffSignUp />} />
                <Route path='/login' element={<LoginForm />} />

                <Route path='/shipments/create' element={
                    <ProtectedRoute>
                        <CreateShipmentForm />
                    </ProtectedRoute>
                } />

                <Route path='/admin/shipments/edit' element={
                    <AdminRoute>
                        <EditShipmentFinancials />
                    </AdminRoute>
                } />

                <Route path='*' element={<NotFound />} />
            </Routes>
        </div>
    )
}

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App