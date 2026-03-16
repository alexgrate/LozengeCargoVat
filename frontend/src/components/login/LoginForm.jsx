import React, { useState } from 'react'
import { User, Mail, LockKeyhole, EyeClosed, EyeOff } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../constants/AuthContext'

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const user = await login(formData.email, formData.password)

            // Redirect based on role
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard')
            } else {
                navigate('/staff/dashboard')
            }
        } catch (err) {
            const data = err.response?.data
            if (data?.error) {
                setError(data.error)
            } else if (data?.non_field_errors) {
                setError(data.non_field_errors[0])
            } else {
                setError('Something went wrong. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='bg-blue-50 flex items-center justify-center py-12 px-4'>
            <div className='max-w-sm w-full'>
                <div className='shadow-md bg-white rounded-lg mt-8 p-8'>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 mb-4">
                        <User className='text-white' />
                    </div>
                    <h2 className='mt-6 text-center text-2xl font-bold text-gray-900'>Welcome Back</h2>
                    <p className='mt-1 text-center text-sm text-gray-600'>Sign in to your logistics account</p>

                    {error && (
                        <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                            <p className='text-xs text-red-600'>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='mt-6'>
                        <div>
                            <label htmlFor="email" className='block text-xs font-medium text-gray-700 mb-2'>Email Address</label>
                            <div className='relative'>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className='w-4 h-4 text-gray-500' />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="text-sm pl-10 block w-full pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2">Password</label>
                            <div className='relative'>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockKeyhole className='w-4 h-4 text-gray-500' />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="text-sm pl-10 block w-full pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="text-gray-500">{showPassword ? <EyeOff className='w-4 h-4' /> : <EyeClosed className='w-4 h-4' />}</span>
                                </button>
                            </div>
                        </div>

                        <div className='flex items-center justify-between mt-4'>
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs font-normal cursor-pointer text-gray-900">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-xs">
                                <a href="#" className="text-blue-600 hover:text-blue-500 cursor-pointer">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative mt-4 cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-5">
                        <p className="text-xs text-gray-600">
                            Don't have an account?{' '}
                            <NavLink to="/register" className="font-medium text-xs text-blue-600 hover:text-blue-500">
                                Sign up here
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LoginForm