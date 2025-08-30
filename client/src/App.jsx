import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? 'https://www.brainmesh.in' : 'http://localhost:5000'
axios.defaults.withCredentials = true

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Ows from './pages/Ows'
import Iph from './pages/Iph'
import Top200 from './pages/Top200'
import Quiz from './pages/Quiz'
import Payment from './pages/Payment'
import PaymentValidate from './pages/PaymentValidate'
import VocabOws from './pages/VocabOws'
import VocabIph from './pages/VocabIph'
import Synonyms from './pages/Synonyms'
import Antonyms from './pages/Antonyms'
import VocabSynonyms from './pages/VocabSynonyms'
import VocabAntonyms from './pages/VocabAntonyms'
import SimplePrivacyPolicy from './pages/SimplePrivacyPolicy'
import SimpleTermsConditions from './pages/SimpleTermsConditions'
import SimpleRefundPolicy from './pages/SimpleRefundPolicy'

function Protected({ children, user }) {
    const location = useLocation();
    if (!user) return (
        <Navigate 
            to="/login" 
            replace 
            state={{ msg: 'Please login to continue', next: location.pathname + location.search }}
        />
    );
    return children;
}

function PremiumProtected({ children, user }) {
    const location = useLocation();
    const hasPremium = !!(user && user.subscription && Array.isArray(user.subscription.plans) && user.subscription.plans.includes('premium'));
    if (!user) return (
        <Navigate to="/login" replace state={{ msg: 'Please login to continue', next: location.pathname + location.search }} />
    );
    if (!hasPremium) return (
        <Navigate to="/payment?plan=premium" replace state={{ msg: 'Premium plan required' }} />
    );
    return children;
}

function AuthGuard({ children, user }) {
    if (user) return <Navigate to="/" />;
    return children;
}

export default function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const location = useLocation()

    useEffect(() => {
        async function me() {
            try {
                const r = await axios.get('/api/auth/me', { withCredentials: true });
                if (r.data && r.data.user) {
                    const userData = { 
                        ...r.data.user, 
                        subscription: r.data.subscription || null
                    };
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (e) {
                setUser(null);
            } finally {
                setLoading(false)
            }
        }
        me();
    }, [])

    // Refresh user data when returning from payment
    useEffect(() => {
        if (location.pathname === '/' && location.search.includes('payment=success')) {
            // Refresh user data after successful payment
            async function refreshUser() {
                try {
                    const r = await axios.get('/api/auth/me', { withCredentials: true });
                    if (r.data && r.data.user) {
                        const userData = { 
                            ...r.data.user, 
                            subscription: r.data.subscription || null
                        };
                        setUser(userData);
                    }
                } catch (e) {
                    console.error('Failed to refresh user data:', e);
                }
            }
            refreshUser();
        }
    }, [location])

    // Remove automatic auth refresh on route changes to prevent logout loops

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, { withCredentials: true })
            setUser(null)
        } catch (e) {
            console.error('Logout failed:', e)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div>
            <Routes>
                <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
                <Route path="/login" element={<AuthGuard user={user}><Login onLogin={(u, sub) => setUser({ ...u, subscription: sub || null })} /></AuthGuard>} />
                <Route path="/register" element={<AuthGuard user={user}><Register onRegister={(u, sub) => setUser({ ...u, subscription: sub || null })} /></AuthGuard>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/ows" element={<Protected user={user}><Ows /></Protected>} />
                <Route path="/iph" element={<Protected user={user}><Iph /></Protected>} />
                <Route path="/top200" element={<Protected user={user}><Top200 /></Protected>} />
                <Route path="/quiz" element={<Quiz user={user} />} />
                <Route path="/payment" element={<Protected user={user}><Payment user={user} /></Protected>} />
                <Route path="/payment/validate/:orderId" element={<Protected user={user}><PaymentValidate /></Protected>} />
                <Route path="/vocab-ows/:letter" element={<Protected user={user}><VocabOws user={user} /></Protected>} />
                <Route path="/vocab-iph/:letter" element={<Protected user={user}><VocabIph user={user} /></Protected>} />
                <Route path="/vocab-synonyms/:letter" element={<Protected user={user}><VocabSynonyms user={user} /></Protected>} />
                <Route path="/vocab-antonyms/:letter" element={<Protected user={user}><VocabAntonyms user={user} /></Protected>} />
                <Route path="/synonyms" element={<Protected user={user}><Synonyms /></Protected>} />
                <Route path="/antonyms" element={<Protected user={user}><Antonyms /></Protected>} />
                <Route path="/privacy-policy" element={<SimplePrivacyPolicy />} />
                <Route path="/terms-conditions" element={<SimpleTermsConditions />} />
                <Route path="/refund-policy" element={<SimpleRefundPolicy />} />
            </Routes>
        </div>
    )
}
