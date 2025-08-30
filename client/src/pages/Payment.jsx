import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSearchParams, Link } from 'react-router-dom'

export default function Payment({ user }) {
    const [searchParams] = useSearchParams();
    const [selectedPlan, setSelectedPlan] = useState('6months');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const plans = [
        {
            id: 'trial',
            name: '7 Days Trial',
            price: 19,
            originalPrice: 49,
            discount: '61% OFF',
            duration: '7 Days Access',
            badge: '🔥 Limited Offer',
            badgeColor: 'from-blue-500 to-blue-600',
            buttonColor: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
            features: [
                'All Basic Features',
                'One-Word Substitutions (A-Z)',
                'Idioms & Phrases (A-Z)',
                'Daily Word of the Day'
            ]
        },
        {
            id: '3months',
            name: '3 Months Plan',
            price: 129,
            originalPrice: 299,
            discount: '57% OFF',
            duration: '3 Months Access',
            badge: '🎯 Popular Choice',
            badgeColor: 'from-green-500 to-green-600',
            buttonColor: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
            features: [
                'All Premium Features',
                '3 Months Full Access',
                'Advanced Quiz System',
                'Priority Email Support'
            ]
        },
        {
            id: '6months',
            name: '6 Months Plan',
            price: 219,
            originalPrice: 499,
            discount: '56% OFF',
            duration: '6 Months Access',
            badge: '⭐ Best Value',
            badgeColor: 'from-purple-500 to-purple-600',
            buttonColor: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
            popular: true,
            features: [
                'All Premium Features',
                'Synonyms & Antonyms (A-Z)',
                'Advanced Quiz System',
                'Priority Support'
            ]
        },
        {
            id: '1year',
            name: '12 Months Plan',
            price: 349,
            originalPrice: 699,
            discount: '50% OFF',
            duration: '12 Months Access',
            badge: '💎 Ultimate Plan',
            badgeColor: 'from-yellow-600 to-orange-600',
            buttonColor: 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
            features: [
                'All Premium Features',
                '12 Months Full Access',
                'Exclusive Study Materials',
                '30-Day Money Back Guarantee'
            ]
        }
    ];

    useEffect(() => {
        const qp = (searchParams.get('plan') || '').toLowerCase();
        const validPlan = plans.find(p => p.id === qp);
        if (validPlan) {
            setSelectedPlan(qp);
        }
        
        // Scroll to payment section (bottom) if hash is present
        if (window.location.hash === '#subscription-plans') {
            setTimeout(() => {
                const element = document.querySelector('.max-w-md.mx-auto.bg-white.rounded-2xl.shadow-lg.p-6');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 100);
        }
    }, [searchParams]);

    const selectedPlanData = plans.find(p => p.id === selectedPlan);

    async function initiate() {
        if (!user) return window.location.href = '/login';
        const digitsOnly = (phone || '').replace(/\D/g, '');
        if (digitsOnly.length < 10) {
            setError('Please enter a valid 10-digit PhonePe number');
            return;
        }
        setLoading(true);
        try {
            const amount = selectedPlanData.price;
            const r = await axios.post('/api/pay/initiate', { plan: selectedPlan, amount, mobileNumber: digitsOnly }, { withCredentials: true });
            if (r.data && r.data.paymentUrl) {
                window.location.href = r.data.paymentUrl;
            }
        } catch (e) { 
            console.error(e); 
            const errorMsg = e.response?.data?.error || e.response?.data?.details || e.message || 'Could not initiate payment';
            if (errorMsg === 'token_expired') {
                alert('Your session has expired. Please log out and log back in.');
                window.location.href = '/login';
                return;
            }
            alert(`Payment Error: ${errorMsg}`);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                {/* Enhanced Pricing Section */}
                <section className="mt-12 px-2 sm:px-0">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Choose Your Perfect Plan
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Unlock unlimited vocabulary learning with premium features and advanced quizzes
                        </p>
                    </div>

                    <div id="subscription-plans" className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative ${
                                    plan.popular 
                                        ? 'bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-300 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'
                                        : 'bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300'
                                } cursor-pointer ${
                                    selectedPlan === plan.id ? 'ring-2 ring-indigo-500' : ''
                                }`}
                                onClick={() => setSelectedPlan(plan.id)}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="relative">
                                            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl border-2 border-white">
                                                <span className="relative z-10 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    MOST POPULAR
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-sm opacity-30"></div>
                                        </div>
                                    </div>
                                )}

                                <div className="text-center">
                                    <div className={`bg-gradient-to-r ${plan.badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block ${plan.popular ? 'mt-2' : ''}`}>
                                        {plan.badge}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                                        <span className="text-lg text-gray-500 line-through ml-2">₹{plan.originalPrice}</span>
                                    </div>
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-6 inline-block">
                                        {plan.discount}
                                    </div>
                                    <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="text-center">
                                        <div className={`w-4 h-4 rounded-full mx-auto ${
                                            selectedPlan === plan.id ? 'bg-indigo-500' : 'bg-gray-300'
                                        }`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Payment Section */}
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Your Purchase</h2>
                    <p className="text-center text-gray-600 mb-6">Secure payment with PhonePe</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Selected Plan</span>
                            <span className="font-bold text-indigo-600">{selectedPlanData?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Total Amount</span>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-gray-900">₹{selectedPlanData?.price}</span>
                                <div className="text-sm text-gray-500">
                                    <span className="line-through">₹{selectedPlanData?.originalPrice}</span>
                                    <span className="text-green-600 ml-2">Save ₹{selectedPlanData?.originalPrice - selectedPlanData?.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">PhonePe Mobile Number</label>
                        <input 
                            value={phone} 
                            onChange={e => { setPhone(e.target.value); setError(''); }} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                            type="tel"
                            required
                            inputMode="numeric"
                            pattern="[0-9]{10,}"
                            minLength={10}
                            placeholder="Enter 10-digit mobile number"
                        />
                        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
                    </div>

                    <button 
                        onClick={initiate} 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : (
                            `Pay ₹${selectedPlanData?.price} Securely`
                        )}
                    </button>

                    <div className="text-center mt-4 text-sm text-gray-500">
                        🔒 Secured by PhonePe • Instant activation • 100% safe
                    </div>
                </div>
            </div>
        </div>
    )
}
