import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logo from "../../assets/logo.png"
import { Menu, X, LogOut, User, LayoutDashboard, Package, Users, PlusCircle, Search } from "lucide-react"
import { useAuth } from '../../constants/AuthContext';

const NavBar = () => {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const toggleNavbar = () => setMobileDrawerOpen(!mobileDrawerOpen)
    const closeDrawer = () => setMobileDrawerOpen(false)

    const handleLogout = async () => {
        await logout()
        closeDrawer()
        navigate('/login')
    }

    if (location.pathname === '/setup') return null

    const staffLinks = [
        { label: 'Dashboard', href: '/staff/dashboard', icon: <LayoutDashboard className='w-4 h-4' /> },
        { label: 'Shipments', href: '/shipments', icon: <Package className='w-4 h-4' /> },
        { label: 'New Shipment', href: '/shipments/create', icon: <PlusCircle className='w-4 h-4' /> },
    ]

    const adminLinks = [
        { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className='w-4 h-4' /> },
        { label: 'Shipments', href: '/shipments', icon: <Package className='w-4 h-4' /> },
        { label: 'New Shipment', href: '/shipments/create', icon: <PlusCircle className='w-4 h-4' /> },
        { label: 'Edit Financials', href: '/admin/shipments/edit', icon: <Search className='w-4 h-4' /> },
        { label: 'Users', href: '/admin/users', icon: <Users className='w-4 h-4' /> },
    ]

    const navLinks = isAdmin ? adminLinks : staffLinks

    return (
        <nav className='sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/10 bg-white/90'>
            <div className="container px-4 mx-auto relative text-sm">
                <div className='flex justify-between items-center'>

                    {/* Logo */}
                    <div className='flex items-center shrink-0'>
                        <NavLink to={user ? (isAdmin ? '/admin/dashboard' : '/staff/dashboard') : '/'}>
                            <img className='h-8 w-auto' src={logo} alt="logo" />
                        </NavLink>
                    </div>

                    {user && (
                        <ul className='hidden lg:flex ml-8 space-x-8'>
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <NavLink
                                        to={link.href}
                                        className={({ isActive }) =>
                                            `flex items-center gap-1.5 py-1 border-b-2 transition-colors duration-200 ${
                                                isActive
                                                    ? 'border-[#dc2626] text-[#dc2626]'
                                                    : 'border-transparent text-gray-600 hover:text-[#dc2626]'
                                            }`
                                        }
                                    >
                                        {link.icon}
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="hidden lg:flex justify-center space-x-2 items-center">
                        {user ? (
                            <div className='flex items-center gap-3'>
                                <div className='flex items-center gap-2 text-sm text-gray-600'>
                                    <div className='w-7 h-7 rounded-full bg-red-100 flex items-center justify-center'>
                                        <User className='w-4 h-4 text-[#dc2626]' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-xs font-medium text-gray-800 leading-none'>{user.full_name}</span>
                                        <span className={`text-xs mt-0.5 ${isAdmin ? 'text-[#dc2626]' : 'text-blue-500'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className='flex items-center gap-1.5 py-1.5 px-3 rounded-md border border-gray-200 hover:border-red-300 hover:text-[#dc2626] text-gray-600 transition-colors duration-200 text-xs'
                                >
                                    <LogOut className='w-3.5 h-3.5' />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <NavLink
                                    to="/login"
                                    className='py-2 px-3 rounded-md hover:text-[#dc2626] text-gray-600 transition-colors duration-200'
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/register"
                                    className='bg-[#dc2626] hover:bg-[#b82222] text-white py-2 px-3 rounded-md transition-colors duration-200'
                                >
                                    Sign Up
                                </NavLink>
                            </>
                        )}
                    </div>

                    <div className='lg:hidden flex items-center'>
                        <button onClick={toggleNavbar} className='cursor-pointer p-1'>
                            {mobileDrawerOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
                        </button>
                    </div>
                </div>

                {mobileDrawerOpen && (
                    <div className="fixed top-14.25 left-0 right-0 z-20 bg-white shadow-lg p-5 flex flex-col lg:hidden border-t border-gray-100">

                        {user && (
                            <div className='flex items-center gap-2 mb-4 pb-4 border-b border-gray-100'>
                                <div className='w-8 h-8 rounded-full bg-red-100 flex items-center justify-center'>
                                    <User className='w-4 h-4 text-[#dc2626]' />
                                </div>
                                <div>
                                    <p className='text-xs font-medium text-gray-800'>{user.full_name}</p>
                                    <span className={`text-xs ${isAdmin ? 'text-[#dc2626]' : 'text-blue-500'}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        )}

                        {user && (
                            <ul className='space-y-1 mb-4'>
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <NavLink
                                            to={link.href}
                                            onClick={closeDrawer}
                                            className={({ isActive }) =>
                                                `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors duration-200 ${
                                                    isActive
                                                        ? 'bg-red-50 text-[#dc2626] font-medium'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#dc2626]'
                                                }`
                                            }
                                        >
                                            {link.icon}
                                            {link.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="border-t border-gray-100 pt-4">
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className='flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-red-50 hover:text-[#dc2626] transition-colors duration-200'
                                >
                                    <LogOut className='w-4 h-4' />
                                    Logout
                                </button>
                            ) : (
                                <div className='space-y-2'>
                                    <NavLink
                                        to="/login"
                                        onClick={closeDrawer}
                                        className='block w-full text-center py-2.5 px-3 rounded-md border border-gray-200 text-sm text-gray-600 hover:border-red-300 hover:text-[#dc2626] transition-colors duration-200'
                                    >
                                        Login
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        onClick={closeDrawer}
                                        className='block w-full text-center py-2.5 rounded-md bg-[#dc2626] text-white text-sm hover:bg-[#b82222] transition-colors duration-200'
                                    >
                                        Sign Up
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar