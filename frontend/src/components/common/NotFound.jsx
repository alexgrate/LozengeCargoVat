import { useNavigate } from 'react-router-dom'
import { PackageX } from 'lucide-react'

const NotFound = () => {
    const navigate = useNavigate()
    return (
        <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4'>
            <div className='text-center'>
                <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                    <PackageX className='w-8 h-8 text-[#dc2626]' />
                </div>
                <h1 className='text-6xl font-bold text-gray-900 mb-2'>404</h1>
                <h2 className='text-xl font-semibold text-gray-700 mb-2'>Page Not Found</h2>
                <p className='text-sm text-gray-500 mb-8'>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                    <button
                        onClick={() => navigate(-1)}
                        className='px-5 py-2.5 rounded-md border border-gray-300 text-sm text-gray-600 hover:border-red-300 hover:text-[#dc2626] transition-colors duration-200'
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className='px-5 py-2.5 rounded-md bg-[#dc2626] text-white text-sm hover:bg-[#b82222] transition-colors duration-200'
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFound