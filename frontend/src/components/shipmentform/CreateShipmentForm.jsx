import { useState } from 'react'
import { Package, User, Weight, Truck, Calendar, DollarSign, FileText, MessageSquare } from 'lucide-react'
import { useAuth } from '../../constants/AuthContext'
import api from '../../api/axios'

const CreateShipmentForm = () => {
    const { isAdmin } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const today = new Date().toISOString().split('T')[0]

    const [formData, setFormData] = useState({
        customer_name: '',
        weight: '',
        transaction_details: '',
        carrier: 'DHL',
        date_of_payment: today,
        date_of_payment_to_carrier: today,
        other_cost: '',
        status: 'UNPAID',
        comments: '',
        payment_made: '',
        cost_of_shipping: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const payload = {
                customer_name: formData.customer_name,
                weight: formData.weight,
                transaction_details: formData.transaction_details,
                carrier: formData.carrier,
                date_of_payment: formData.date_of_payment || null,
                date_of_payment_to_carrier: formData.date_of_payment_to_carrier || null,
                other_cost: formData.other_cost || 0,
                status: formData.status,
                comments: formData.comments,
            }

            const res = await api.post('/shipments/', payload)
            const reference = res.data.shipment.reference

            if (isAdmin && (formData.payment_made || formData.cost_of_shipping)) {
                await api.patch(`/shipments/admin/financials/${reference}/`, {
                    payment_made: formData.payment_made || 0,
                    cost_of_shipping: formData.cost_of_shipping || 0,
                })
            }

            setSuccess(`Shipment created! Reference: ${reference}`)
            setFormData({
                customer_name: '',
                weight: '',
                transaction_details: '',
                carrier: 'DHL',
                date_of_payment: '',
                date_of_payment_to_carrier: '',
                other_cost: '',
                status: 'UNPAID',
                comments: '',
                payment_made: '',
                cost_of_shipping: '',
            })
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
        <section className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto'>

                <div className='mb-8'>
                    <h2 className='text-2xl sm:text-3xl font-bold text-gray-900'>Create Shipment</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Fill in the shipment details. A unique tracking reference will be auto-generated.
                    </p>
                </div>

                {error && (
                    <div className='mb-6 p-3 bg-red-50 border border-red-200 rounded-md'>
                        <p className='text-xs text-red-600'>{error}</p>
                    </div>
                )}
                {success && (
                    <div className='mb-6 p-3 bg-green-50 border border-green-200 rounded-md'>
                        <p className='text-xs text-green-600 font-medium'>{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                        <h3 className='text-sm font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100'>
                            Shipment Details
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>

                            <div className='sm:col-span-2'>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Customer Name *</label>
                                <div className='relative'>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className='w-4 h-4 text-gray-400' />
                                    </div>
                                    <input
                                        name="customer_name"
                                        type="text"
                                        required
                                        placeholder="Customer name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Weight *</label>
                                <div className='relative'>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Weight className='w-4 h-4 text-gray-400' />
                                    </div>
                                    <input
                                        name="weight"
                                        type="text"
                                        required
                                        placeholder="e.g 50KG"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Carrier *</label>
                                <div className='relative'>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Truck className='w-4 h-4 text-gray-400' />
                                    </div>
                                    <select
                                        name="carrier"
                                        value={formData.carrier}
                                        onChange={handleChange}
                                        className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="DHL">DHL</option>
                                        <option value="DHL_CASH">DHL Cash</option>
                                        <option value="FEDEX">FedEx</option>
                                        <option value="UPS">UPS</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className='sm:col-span-2'>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Transaction Details</label>
                                <div className='relative'>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className='w-4 h-4 text-gray-400' />
                                    </div>
                                    <input
                                        name="transaction_details"
                                        type="text"
                                        placeholder="e.g DHL BULK"
                                        value={formData.transaction_details}
                                        onChange={handleChange}
                                        className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Date of Payment</label>
                                <div className='relative'>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className='w-4 h-4 text-gray-400' />
                                    </div>
                                    <input
                                        name="date_of_payment"
                                        type="date"
                                        value={formData.date_of_payment}
                                        onChange={handleChange}
                                        className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Payment to Carrier</label>
                                <div className='relative'>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className='w-4 h-4 text-gray-400' />
                                    </div>
                                    <input
                                        name="date_of_payment_to_carrier"
                                        type="date"
                                        value={formData.date_of_payment_to_carrier}
                                        onChange={handleChange}
                                        className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Other Cost</label>
                                <div className='relative'>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className='w-4 h-4 text-gray-400' />
                                    </div>
                                    <input
                                        name="other_cost"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.other_cost}
                                        onChange={handleChange}
                                        className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="text-sm block w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                >
                                    <option value="UNPAID">Unpaid</option>
                                    <option value="PAID">Paid</option>
                                </select>
                            </div>

                            <div className='sm:col-span-2'>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>Comments</label>
                                <div className='relative'>
                                    <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none">
                                        <MessageSquare className='w-4 h-4 text-gray-400' />
                                    </div>
                                    <textarea
                                        name="comments"
                                        rows={3}
                                        placeholder="Additional notes..."
                                        value={formData.comments}
                                        onChange={handleChange}
                                        className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                            <h3 className='text-sm font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-100 flex items-center gap-2'>
                                <DollarSign className='w-4 h-4 text-[#dc2626]' />
                                Financial Details
                                <span className='text-xs font-normal text-[#dc2626] bg-red-50 px-2 py-0.5 rounded-full'>Admin Only</span>
                            </h3>
                            <p className='text-xs text-gray-500 mb-4'>These fields are only visible to admins.</p>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>

                                <div>
                                    <label className='block text-xs font-medium text-gray-700 mb-1'>Payment Made</label>
                                    <div className='relative'>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className='w-4 h-4 text-gray-400' />
                                        </div>
                                        <input
                                            name="payment_made"
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.payment_made}
                                            onChange={handleChange}
                                            className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-xs font-medium text-gray-700 mb-1'>Cost of Shipping</label>
                                    <div className='relative'>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className='w-4 h-4 text-gray-400' />
                                        </div>
                                        <input
                                            name="cost_of_shipping"
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.cost_of_shipping}
                                            onChange={handleChange}
                                            className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#dc2626] text-white font-semibold py-3 px-4 rounded-md hover:bg-[#b82222] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Shipment...' : 'Create Shipment'}
                    </button>
                </form>
            </div>
        </section>
    )
}

export default CreateShipmentForm