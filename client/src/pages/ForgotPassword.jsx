import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [resetToken, setResetToken] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await axios.post('/api/auth/forgot-password', { email })
            setMessage('Password reset instructions sent to your email')
            setResetToken(response.data.resetToken) // For demo purposes
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Forgot your password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    {message && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="text-sm text-green-700">{message}</div>
                            {resetToken && (
                                <div className="mt-2">
                                    <p className="text-xs text-green-600">Demo Token: {resetToken}</p>
                                    <Link 
                                        to={`/reset-password?token=${resetToken}`}
                                        className="text-xs text-indigo-600 hover:text-indigo-500"
                                    >
                                        Click here to reset password
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
