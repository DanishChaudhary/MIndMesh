import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link, useLocation } from 'react-router-dom'

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [err, setErr] = useState(null)
    const nav = useNavigate();
    const location = useLocation();

    async function submit(e) {
        e.preventDefault();
        try {
            const r = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
            if (r.data && r.data.user) {
                onLogin && onLogin(r.data.user, r.data.subscription);
                const next = location.state?.next || '/';
                nav(next, { replace: true }); 
            } else {
                setErr('login_failed');
            }
        } catch (e) { 
            setErr(e.response?.data?.error || 'login_failed'); 
        }
    }

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" 
             style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f3e8ff 100%)'}}>
            <div className="max-w-5xl w-full min-h-[650px] bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm flex flex-col lg:flex-row">
                {/* Illustration Section */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative overflow-hidden"
                     style={{background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'}}>
                    <div className="text-center z-10 max-w-md">
                        <h2 className="text-2xl font-bold text-[#2f2f2f] mb-4">Welcome Back to BrainMesh</h2>
                        <p className="text-[#6c6c6c] mb-6">
                            Your intelligent vocabulary learning platform. Master words through adaptive quizzes, spaced repetition, and personalized learning paths designed for competitive exam success.
                        </p>
                        
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
                <div className="flex-1 p-6 sm:p-8 lg:p-12 bg-white flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#2f2f2f] mb-2 relative inline-block">
                            Welcome Back
                            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded"></span>
                        </h1>
                        <p className="text-[#6c6c6c] mt-4">Sign in to continue your vocabulary journey</p>
                    </div>
                    
                    <form onSubmit={submit} className="w-full">
                        {location.state?.msg && (
                            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
                                {location.state.msg}
                            </div>
                        )}
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
                                    placeholder="Enter your password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#6366f1] focus:ring-0 transition-all duration-200 ease-out focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] hover:border-gray-400"
                                />
                                <span 
                                    onClick={togglePassword}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6c6c6c] cursor-pointer"
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </span>
                            </div>
                        </div>
                        
                        {/* Forgot Password */}
                        <div className="flex justify-between items-center mb-6 text-sm">
                            <Link to="/forgot-password" className="text-[#6366f1] hover:text-[#4f46e5] hover:underline transition-all duration-200 ease-out font-medium">Forgot password?</Link>
                        </div>
                        
                        {/* Error Message */}
                        {err && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {err === 'invalid_credentials' ? 'Invalid email or password' : 
                                 err === 'email_and_password_required' ? 'Email and password are required' : 
                                 'Login failed. Please try again.'}
                            </div>
                        )}
                        
                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl hover:from-[#4f46e5] hover:to-[#7c3aed] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] transition-all duration-200 ease-out active:scale-[0.98]"
                        >
                            Login
                        </button>
                        
                        {/* Register Link */}
                        <div className="text-center mt-6 text-sm text-[#6c6c6c]">
                            <p>Don't have an account? <Link to="/register" className="text-[#6366f1] font-semibold hover:text-[#4f46e5] hover:underline transition-all duration-200 ease-out">Create Account</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
