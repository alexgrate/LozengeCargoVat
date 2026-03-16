import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './constants/AuthContext';

import HomePage from './components/Home/HomePage';
import NavBar from './components/Navbar/NavBar';
import StaffSignUp from './components/Register/StaffSignUp';
import LoginForm from './components/Login/LoginForm';
import SetupPage from './components/Setup/SetupPage';
import CreateShipmentForm from './components/Shipmentform/CreateShipmentForm';
import EditShipmentFinancials from './components/Shipmentform/EditShipmentFinancials';


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
      <NavBar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/setup' element={<SetupPage />} />
        <Route path='/register' element={<StaffSignUp />} />
        <Route path='/login' element={<LoginForm />} />
        <Route path='/shipments/create' element={<CreateShipmentForm />} />
        <Route path='/admin/shipments/edit' element={<EditShipmentFinancials />} />
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