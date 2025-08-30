import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register({ onRegister }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [err, setErr] = useState(null)
    const [loading, setLoading] = useState(false)
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        setErr(null);
        
        // Client-side validation
        if (password !== confirmPassword) {
            setErr('Passwords do not match');
            setLoading(false);
            return;
        }
        
        if (!termsAccepted) {
            setErr('Please accept the terms and conditions');
            setLoading(false);
            return;
        }

        try {
            const r = await axios.post('/api/auth/register', { name, email, password, confirmPassword }, { withCredentials: true });
            if (r.data && r.data.user) { 
                onRegister && onRegister(r.data.user, r.data.subscription); 
                nav('/'); 
            } else {
                setErr('registration_failed');
            }
        } catch (e) { 
            setErr(e.response?.data?.error || 'Registration failed'); 
        } finally {
            setLoading(false);
        }
    }

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    const checkPasswordMatch = () => {
        if (password && confirmPassword) {
            return password === confirmPassword;
        }
        return null;
    }

    const passwordMatch = checkPasswordMatch();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" 
             style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f3e8ff 100%)'}}>
            <div className="max-w-5xl w-full min-h-[700px] bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm flex flex-col lg:flex-row">
                {/* Illustration Section */}
                <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative overflow-hidden"
                     style={{background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'}}>
                    <div className="text-center z-10 max-w-md">
                        <h2 className="text-2xl font-bold text-[#2f2f2f] mb-4">Join BrainMesh Today</h2>
                        <p className="text-[#6c6c6c] mb-6">Connect your mind to intelligent vocabulary learning. Start your journey to exam success with personalized, adaptive learning.</p>

                        <div className="flex justify-center gap-4 mt-8">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.1)] text-xl text-[#6366f1] hover:scale-105 transition-transform duration-200 ease-out">
                                <i className="fas fa-brain"></i>
                            </div>
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.1)] text-xl text-[#8b5cf6] hover:scale-105 transition-transform duration-200 ease-out">
                                <i className="fas fa-network-wired"></i>
                            </div>
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.1)] text-xl text-[#06b6d4] hover:scale-105 transition-transform duration-200 ease-out">
                                <i className="fas fa-graduation-cap"></i>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-4 left-5 transform rotate-12 opacity-[0.08] text-7xl text-[#6366f1] z-0">
                        <i className="fas fa-brain"></i>
                    </div>
                    <div className="absolute bottom-4 right-5 transform -rotate-12 opacity-[0.08] text-7xl text-[#8b5cf6] z-0">
                        <i className="fas fa-network-wired"></i>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12 bg-white overflow-y-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#2f2f2f] mb-2 relative inline-block">
                            Create Account
                            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded"></span>
                        </h1>
                        <p className="text-[#6c6c6c] mt-4">Start your intelligent vocabulary learning journey</p>
                    </div>

                    <form onSubmit={submit} className="w-full">
                        {/* Name Input */}
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-sm font-medium text-[#2f2f2f] mb-2">Your Name</label>
                            <div className="relative">
                                <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6c6c6c]"></i>
                                <input 
                                    type="text" 
                                    id="name" 
                                    placeholder="Enter your name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#6366f1] focus:ring-0 transition-all duration-200 ease-out focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] hover:border-gray-400"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-sm font-medium text-[#2f2f2f] mb-2">Email Address</label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6c6c6c]"></i>
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder="Enter your email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#6366f1] focus:ring-0 transition-all duration-200 ease-out focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] hover:border-gray-400"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-[#2f2f2f] mb-2">Password</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6c6c6c]"></i>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    id="password" 
                                    placeholder="Create a password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#ff6e56] focus:ring-0 transition-all duration-[0.25s] ease-in-out focus:shadow-[0_0_0_3px_rgba(255,110,86,0.2)]"
                                />
                                <span 
                                    onClick={togglePassword}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6c6c6c] cursor-pointer"
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </span>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2f2f2f] mb-2">Confirm Password</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6c6c6c]"></i>
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword" 
                                    placeholder="Confirm your password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#ff6e56] focus:ring-0 transition-all duration-[0.25s] ease-in-out focus:shadow-[0_0_0_3px_rgba(255,110,86,0.2)]"
                                />
                                <span 
                                    onClick={toggleConfirmPassword}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6c6c6c] cursor-pointer"
                                >
                                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </span>
                            </div>
                            {password && confirmPassword && (
                                <div className="mt-2 text-xs">
                                    {passwordMatch ? (
                                        <span className="text-green-500">
                                            <i className="fas fa-check-circle mr-1"></i> Passwords match
                                        </span>
                                    ) : (
                                        <span className="text-red-500">
                                            <i className="fas fa-exclamation-circle mr-1"></i> Passwords do not match
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start gap-3 mb-6 text-sm text-[#6c6c6c]">
                            <input 
                                type="checkbox" 
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="mt-1 w-4 h-4 accent-[#6366f1] cursor-pointer flex-shrink-0"
                                required
                            />
                            <label htmlFor="terms" className="cursor-pointer">
                                I agree to the <a href="#" className="text-[#6366f1] hover:text-[#4f46e5] hover:underline transition-all duration-200 ease-out font-medium">Terms of Service</a> and <a href="#" className="text-[#6366f1] hover:text-[#4f46e5] hover:underline transition-all duration-200 ease-out font-medium">Privacy Policy</a>
                            </label>
                        </div>

                        {/* Error Message */}
                        {err && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {err === 'user_exists' ? 'User with this email already exists' : 
                                 err === 'email_and_password_required' ? 'All fields are required' : 
                                 err === 'invalid_email' ? 'Please enter a valid Gmail address (@gmail.com)' :
                                 err === 'passwords_do_not_match' ? 'Passwords do not match' :
                                 err}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl hover:from-[#4f46e5] hover:to-[#7c3aed] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Sign In Link */}
                        <div className="text-center mt-6 text-sm text-[#6c6c6c]">
                            <p>Already have an account? <Link to="/login" className="text-[#6366f1] font-semibold hover:text-[#4f46e5] hover:underline transition-all duration-200 ease-out">Sign In</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
