import React, { useState } from 'react'
import { UserPlus, Mail, LockKeyhole, EyeClosed, EyeOff, Phone } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../constants/AuthContext'

const StaffSignUp = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        agreed: false,
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.agreed) {
            setError('You must agree to the Terms and Conditions')
            return
        }

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                confirm_password: formData.confirm_password,
            })
            navigate('/login')
        } catch (err) {
            const data = err.response?.data
            if (data) {
                const firstError = Object.values(data)[0]
                setError(Array.isArray(firstError) ? firstError[0] : firstError)
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
                        <UserPlus className='text-white' />
                    </div>
                    <h2 className='mt-6 text-center text-2xl font-bold text-gray-900'>Create Account</h2>
                    <p className='mt-1 text-center text-sm text-gray-600'>Join our logistics platform today</p>

                    {error && (
                        <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                            <p className='text-xs text-red-600'>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='mt-6'>
                        <div className='flex gap-4 items-center'>
                            <div>
                                <label htmlFor="first_name" className='block text-xs font-medium text-gray-700 mb-2'>First name</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    placeholder='John'
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className='text-sm pl-2 block w-full pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className='block text-xs font-medium text-gray-700 mb-2'>Last name</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    placeholder='Doe'
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className='text-sm pl-2 block w-full pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                        </div>

                        <div className='mt-4'>
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
                                    placeholder="John@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="text-sm pl-10 block w-full pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label htmlFor="phone_number" className='block text-xs font-medium text-gray-700 mb-2'>Phone Number</label>
                            <div className='relative'>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className='w-4 h-4 text-gray-500' />
                                </div>
                                <input
                                    id="phone_number"
                                    name="phone_number"
                                    type="tel"
                                    required
                                    placeholder="+1 (555) 123-4567"
                                    value={formData.phone_number}
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
                                    placeholder="Create Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="text-sm pl-10 block w-full pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                                    <span className="text-gray-500">{showPassword ? <EyeOff className='w-4 h-4' /> : <EyeClosed className='w-4 h-4' />}</span>
                                </button>
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label htmlFor="confirm_password" className="block text-xs font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className='relative'>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockKeyhole className='w-4 h-4 text-gray-500' />
                                </div>
                                <input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    placeholder="Confirm Password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className="text-sm pl-10 block w-full pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <span className="text-gray-500">{showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <EyeClosed className='w-4 h-4' />}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center mt-4">
                            <input
                                id="agreed"
                                name="agreed"
                                type="checkbox"
                                checked={formData.agreed}
                                onChange={handleChange}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="agreed" className="ml-2 block text-xs font-normal cursor-pointer text-gray-900">
                                I agree to the <a href="" className='text-blue-600'>Terms and Conditions</a> and <a href="" className='text-blue-500'>Privacy Policy</a>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative mt-4 cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-5">
                        <p className="text-xs text-gray-600">
                            Already have an account?{' '}
                            <NavLink to="/login" className="font-medium text-xs text-blue-600 hover:text-blue-500">
                                Sign in here
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StaffSignUp