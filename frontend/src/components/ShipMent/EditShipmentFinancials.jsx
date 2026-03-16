import { useState } from 'react'
import { Search, DollarSign, Package, User, Weight, Truck, Calendar, FileText } from 'lucide-react'
import api from '../../api/axios'

const EditShipmentFinancials = () => {
    const [reference, setReference] = useState('')
    const [shipment, setShipment] = useState(null)
    const [searching, setSearching] = useState(false)
    const [saving, setSaving] = useState(false)
    const [searchError, setSearchError] = useState('')
    const [saveError, setSaveError] = useState('')
    const [saveSuccess, setSaveSuccess] = useState('')

    const [financials, setFinancials] = useState({
        payment_made: '',
        cost_of_shipping: '',
    })

    const handleSearch = async (e) => {
        e.preventDefault()
        setSearchError('')
        setShipment(null)
        setSaveSuccess('')
        setSaveError('')
        setSearching(true)

        try {
            const res = await api.get(`/shipments/${reference}/`)
            setShipment(res.data)
            // Pre-fill financials with existing values
            setFinancials({
                payment_made: res.data.payment_made || '',
                cost_of_shipping: res.data.cost_of_shipping || '',
            })
        } catch (err) {
            if (err.response?.status === 404) {
                setSearchError('No shipment found with that reference number.')
            } else {
                setSearchError('Something went wrong. Please try again.')
            }
        } finally {
            setSearching(false)
        }
    }

    const handleFinancialsChange = (e) => {
        const { name, value } = e.target
        setFinancials(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaveError('')
        setSaveSuccess('')
        setSaving(true)

        try {
            const res = await api.patch(`/shipments/admin/financials/${reference}/`, {
                payment_made: financials.payment_made || 0,
                cost_of_shipping: financials.cost_of_shipping || 0,
            })
            setShipment(res.data.shipment)
            setSaveSuccess('Financials updated successfully!')
        } catch (err) {
            const data = err.response?.data
            if (data?.error) {
                setSaveError(data.error)
            } else {
                setSaveError('Failed to update financials. Please try again.')
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <section className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto'>

                {/* Header */}
                <div className='mb-8'>
                    <h2 className='text-2xl sm:text-3xl font-bold text-gray-900'>Edit Shipment Financials</h2>
                    <p className='text-sm text-gray-600 mt-1'>Search by reference number to update financial details.</p>
                </div>

                {/* Search */}
                <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                    <form onSubmit={handleSearch} className='flex gap-3'>
                        <div className='relative flex-1'>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className='w-4 h-4 text-gray-400' />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Enter reference e.g MAR2026-001"
                                value={reference}
                                onChange={(e) => setReference(e.target.value.toUpperCase())}
                                className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={searching}
                            className="bg-[#dc2626] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#b82222] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    {searchError && (
                        <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-md'>
                            <p className='text-xs text-red-600'>{searchError}</p>
                        </div>
                    )}
                </div>

                {/* Shipment Details — shown after search */}
                {shipment && (
                    <>
                        {/* Shipment Info (read only) */}
                        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                            <h3 className='text-sm font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2'>
                                <Package className='w-4 h-4 text-[#dc2626]' />
                                Shipment Info
                                <span className='ml-auto text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>
                                    {shipment.reference}
                                </span>
                            </h3>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                                <div className='flex items-center gap-2 text-gray-600'>
                                    <User className='w-4 h-4 text-gray-400 shrink-0' />
                                    <span className='text-xs text-gray-500'>Customer:</span>
                                    <span className='font-medium text-gray-800'>{shipment.customer_name}</span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-600'>
                                    <Weight className='w-4 h-4 text-gray-400 shrink-0' />
                                    <span className='text-xs text-gray-500'>Weight:</span>
                                    <span className='font-medium text-gray-800'>{shipment.weight}</span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-600'>
                                    <Truck className='w-4 h-4 text-gray-400 shrink-0' />
                                    <span className='text-xs text-gray-500'>Carrier:</span>
                                    <span className='font-medium text-gray-800'>{shipment.carrier}</span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-600'>
                                    <FileText className='w-4 h-4 text-gray-400 shrink-0' />
                                    <span className='text-xs text-gray-500'>Details:</span>
                                    <span className='font-medium text-gray-800'>{shipment.transaction_details || '—'}</span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-600'>
                                    <Calendar className='w-4 h-4 text-gray-400 shrink-0' />
                                    <span className='text-xs text-gray-500'>Date:</span>
                                    <span className='font-medium text-gray-800'>{shipment.date}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs text-gray-500'>Status:</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        shipment.status === 'PAID'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                        {shipment.status}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-600'>
                                    <DollarSign className='w-4 h-4 text-gray-400 shrink-0' />
                                    <span className='text-xs text-gray-500'>Other Cost:</span>
                                    <span className='font-medium text-gray-800'>{shipment.other_cost}</span>
                                </div>
                                {shipment.comments && (
                                    <div className='sm:col-span-2 flex items-start gap-2 text-gray-600'>
                                        <span className='text-xs text-gray-500'>Comments:</span>
                                        <span className='font-medium text-gray-800 text-xs'>{shipment.comments}</span>
                                    </div>
                                )}
                            </div>

                            {/* Current financials summary */}
                            <div className='mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3'>
                                {[
                                    { label: 'Payment Made', value: shipment.payment_made },
                                    { label: 'Cost of Shipping', value: shipment.cost_of_shipping },
                                    { label: 'Revenue', value: shipment.revenue, highlight: true },
                                    { label: 'Profit', value: shipment.profit, highlight: true },
                                ].map((item) => (
                                    <div key={item.label} className={`p-3 rounded-md ${item.highlight ? 'bg-red-50' : 'bg-gray-50'}`}>
                                        <p className='text-xs text-gray-500 mb-1'>{item.label}</p>
                                        <p className={`text-sm font-semibold ${item.highlight ? 'text-[#dc2626]' : 'text-gray-800'}`}>
                                            {item.value ?? '—'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Edit Financials */}
                        <div className='bg-white rounded-lg shadow-sm p-6'>
                            <h3 className='text-sm font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-100 flex items-center gap-2'>
                                <DollarSign className='w-4 h-4 text-[#dc2626]' />
                                Update Financials
                                <span className='text-xs font-normal text-[#dc2626] bg-red-50 px-2 py-0.5 rounded-full'>Admin Only</span>
                            </h3>
                            <p className='text-xs text-gray-500 mb-4'>Revenue and profit will be auto-calculated on save.</p>

                            {saveError && (
                                <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                                    <p className='text-xs text-red-600'>{saveError}</p>
                                </div>
                            )}
                            {saveSuccess && (
                                <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-md'>
                                    <p className='text-xs text-green-600 font-medium'>{saveSuccess}</p>
                                </div>
                            )}

                            <form onSubmit={handleSave}>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
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
                                                value={financials.payment_made}
                                                onChange={handleFinancialsChange}
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
                                                value={financials.cost_of_shipping}
                                                onChange={handleFinancialsChange}
                                                className="text-sm pl-10 block w-full pr-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-[#dc2626] text-white font-semibold py-3 px-4 rounded-md hover:bg-[#b82222] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Financials'}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}

export default EditShipmentFinancials