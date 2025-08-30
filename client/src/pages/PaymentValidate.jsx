import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function PaymentValidate() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('checking')
    const [message, setMessage] = useState('Validating payment...')

    useEffect(() => {
        const checkPayment = async () => {
            try {
                const response = await axios.get(`/api/pay/status/${orderId}`, { withCredentials: true })
                if (response.data.success && response.data.state === 'SUCCESS') {
                    setStatus('success')
                    setMessage('Payment successful! Unlocking features...')
                    setTimeout(() => {
                        navigate('/?payment=success')
                    }, 2000)
                } else if (response.data.success && response.data.state === 'FAILED') {
                    setStatus('failed')
                    setMessage('Payment failed. Please try again.')
                } else {
                    setStatus('failed')
                    setMessage('Payment is being processed. Please wait a moment and refresh.')
                }
            } catch (error) {
                setStatus('error')
                setMessage('Error validating payment. Please contact support.')
            }
        }

        if (orderId) {
            checkPayment()
        }
    }, [orderId, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                {status === 'checking' && (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                )}
                
                {status === 'success' && (
                    <div className="text-green-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                
                {status === 'failed' && (
                    <div className="text-red-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                
                <p className="text-gray-700 mb-4">{message}</p>
                
                {status !== 'checking' && (
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Go to Home
                    </button>
                )}
            </div>
        </div>
    )
}
