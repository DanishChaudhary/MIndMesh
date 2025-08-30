import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Home({ user, onLogout }) {
    const [wotd, setWotd] = useState(null)
    const [practiceQueue, setPracticeQueue] = useState([])
    const [overview, setOverview] = useState({ total: 0, ows: 0, iph: 0, synonyms: 0, antonyms: 0 })
    const [loading, setLoading] = useState(true)
    const [showQuickQuiz, setShowQuickQuiz] = useState(false)
    const [showPracticeQuiz, setShowPracticeQuiz] = useState(false)
    const [userSubscription, setUserSubscription] = useState(null)
    const [knownWords, setKnownWords] = useState(new Set())
    const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Load known words from localStorage
                const savedKnownWords = JSON.parse(localStorage.getItem('knownWords') || '[]')
                setKnownWords(new Set(savedKnownWords))

                // Fetch Word of the Day
                const wotdResponse = await axios.get('/api/vocab/wotd')
                setWotd(wotdResponse.data)

                // Fetch practice queue
                if (user) {
                    const fetchPracticeQueue = async () => {
                        try {
                            // First try to get from localStorage
                            const localQueue = JSON.parse(localStorage.getItem('practiceQueue') || '[]')
                            setPracticeQueue(localQueue)

                            // Also try to fetch from server
                            try {
                                const response = await axios.get('/api/user/practice-queue', { withCredentials: true })
                                const serverQueue = response.data.items || []
                                // Merge with local queue if needed
                                if (serverQueue.length > 0) {
                                    const merged = [...localQueue, ...serverQueue.filter(s =>
                                        !localQueue.find(l => l.word === s.word || l.phrase === s.phrase)
                                    )]
                                    setPracticeQueue(merged)
                                    localStorage.setItem('practiceQueue', JSON.stringify(merged))
                                }
                            } catch (err) {
                                // Server practice queue not available, using localStorage only
                            }
                        } catch (error) {
                            console.error('Error fetching practice queue:', error)
                        }
                    }
                    fetchPracticeQueue()

                    // Fetch user subscription
                    if (user) {
                        const userResponse = await axios.get('/api/user/profile', { withCredentials: true })
                        setUserSubscription(userResponse.data.subscription)
                        
                        // Check if we should show subscription banner
                        const subscription = userResponse.data.subscription
                        if (subscription && subscription.status === 'active' && subscription.remainingDays <= 2) {
                            setShowSubscriptionBanner(true)
                        } else if (subscription && subscription.status === 'expired') {
                            setShowSubscriptionBanner(true)
                        }
                    }

                    // Fetch overview stats
                    const overviewResponse = await axios.get('/api/vocab/overview')
                    setOverview(overviewResponse.data)
                }
            } catch (err) {
                console.error('Error fetching home data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const handleMarkKnown = async (word) => {
        try {
            const newKnownWords = new Set([...knownWords, word])
            setKnownWords(newKnownWords)

            // Save to localStorage
            localStorage.setItem('knownWords', JSON.stringify([...newKnownWords]))

            await axios.post('/api/user/mark-known', { word }, { withCredentials: true })
        } catch (error) {
            console.error('Error marking word as known:', error)
            // Revert on error
            setKnownWords(prev => {
                const newSet = new Set(prev)
                newSet.delete(word)
                // Update localStorage with reverted state
                localStorage.setItem('knownWords', JSON.stringify([...newSet]))
                return newSet
            })
        }
    }

    const handleStartQuickQuiz = () => {
        window.location.href = `/quiz?type=free`
    }

    const handleStartPracticeQuiz = () => {
        setShowPracticeQuiz(true)
    }

    const getDailyWOTD = () => {
        // Get today's date and use it to select a word from wotd.json data
        const today = new Date()
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)

        // If we have wotd data, cycle through it based on day of year
        if (wotd && Array.isArray(wotd)) {
            return wotd[dayOfYear % wotd.length]
        }
        return wotd
    }

    const handleClearQueue = async () => {
        try {
            // Clear localStorage
            localStorage.removeItem('practiceQueue')
            setPracticeQueue([])

            // Also try to clear server
            try {
                await axios.delete('/api/user/practice-queue')
            } catch (err) {
                // Server practice queue not available
            }
        } catch (error) {
            console.error('Error clearing practice queue:', error)
        }
    }

    const handleAddToPractice = async (item) => {
        try {
            // Add to localStorage for practice queue
            const practiceItems = JSON.parse(localStorage.getItem('practiceQueue') || '[]')
            const exists = practiceItems.find(p =>
                (p.word && item.word && p.word === item.word) ||
                (p.phrase && item.phrase && p.phrase === item.phrase)
            )

            if (!exists) {
                practiceItems.push({
                    ...item,
                    addedDate: new Date().toISOString(),
                    type: item.word ? 'ows' : 'iph'
                })
                localStorage.setItem('practiceQueue', JSON.stringify(practiceItems))
                setPracticeQueue(practiceItems)
                // Item added to practice queue
            } else {
                // Item already exists in practice queue
            }

            // Also try to add to server
            try {
                await axios.post('/api/user/practice-queue', item, { withCredentials: true })
            } catch (err) {
                // Server practice queue not available, using localStorage only
            }
        } catch (error) {
            console.error('Error adding to practice:', error)
        }
    }

    const isFeatureUnlocked = (feature) => {
        if (!user) return false
        
        // Check if user has ANY active subscription
        if (userSubscription && userSubscription.status === 'active') {
            // Double check expiry date
            if (userSubscription.expiresAt && new Date() > new Date(userSubscription.expiresAt)) {
                return false
            }
            return true
        }
        
        // Also check user.subscription from App.jsx (fallback)
        if (user.subscription && user.subscription.status === 'active') {
            if (user.subscription.expiresAt && new Date() > new Date(user.subscription.expiresAt)) {
                return false
            }
            return true
        }
        
        // No subscription or inactive subscription = lock all features
        return false
    }

    const isPlanPurchased = (planName) => {
        if (!user) return false
        const userPlans = user.subscription?.plans || []
        return userPlans.includes(planName)
    }

    const getActivePlan = () => {
        if (!user || !user.subscription) return null
        const userPlans = user.subscription?.plans || []
        
        // Priority order: 1year > 6months > 3months > trial
        if (userPlans.includes('1year')) return { name: '12 Months Plan', id: '1year' }
        if (userPlans.includes('6months')) return { name: '6 Months Plan', id: '6months' }
        if (userPlans.includes('3months')) return { name: '3 Months Plan', id: '3months' }
        if (userPlans.includes('trial')) return { name: '7 Days Trial', id: 'trial' }
        
        return null
    }

    const getTimeRemaining = () => {
        if (!user || !user.subscription || !user.subscription.expiresAt) return null
        
        const expiryDate = new Date(user.subscription.expiresAt)
        const now = new Date()
        const timeDiff = expiryDate - now
        
        if (timeDiff <= 0) return 'Expired'
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} remaining`
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} remaining`
        } else {
            return 'Less than 1 hour remaining'
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Subscription Banner */}
            {showSubscriptionBanner && userSubscription && (
                <div className={`w-full ${
                    userSubscription.status === 'expired' 
                        ? 'bg-red-600' 
                        : userSubscription.remainingDays <= 2 
                        ? 'bg-orange-600' 
                        : 'bg-blue-600'
                } text-white py-3 px-4 text-center relative`}>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {userSubscription.status === 'expired' ? (
                                <>
                                    <span className="text-lg">🚫</span>
                                    <span className="font-medium">
                                        Your subscription has expired! Upgrade now to continue accessing premium features.
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">⚠️</span>
                                    <span className="font-medium">
                                        Your subscription expires in {userSubscription.remainingDays} day{userSubscription.remainingDays !== 1 ? 's' : ''}! 
                                        Renew now to avoid losing access.
                                    </span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-gray-800 px-4 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                            {userSubscription.status === 'expired' ? 'Subscribe Now' : 'Renew Now'}
                        </button>
                        <button
                            onClick={() => setShowSubscriptionBanner(false)}
                            className="text-white hover:text-gray-200 text-xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            
            <div className="container mx-auto px-4 py-4 max-w-6xl">
                <main>
                {/* NAV: responsive, accessible, collapsible */}
                <nav className="w-full flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-lg p-2 bg-white/80 shadow-sm flex-shrink-0">
                            <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M4 12c0 4 4 8 8 8s8-4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 4v8l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">BrainMesh</h1>
                            <p className="text-xs text-gray-600 -mt-0.5 truncate">One-Word Substitutions • Idioms • Synonyms • Antonyms</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {user && (
                            <>
                                <div className="hidden sm:flex items-center gap-3">
                                    <button
                                        onClick={handleStartQuickQuiz}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Start Free Quiz
                                    </button>
                                </div>
                                <button
                                    onClick={handleStartQuickQuiz}
                                    className="sm:hidden inline-flex items-center justify-center gap-1 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md text-sm"
                                >
                                    Free Quiz
                                </button>
                            </>
                        )}

                        <div id="auth-area">
                            {user ? (
                                <button onClick={onLogout} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md hover:shadow-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <Link to="/login" state={{ msg: 'Please login to continue' }} className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
                                        Login
                                    </Link>
                                    <Link to="/register" className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-500 text-white hover:bg-zinc-600 shadow-sm">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO + WOTD: responsive two-column that stacks on small screens */}
                <header className="mt-6 rounded-2xl p-4 md:p-6 bg-white/90 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold">Practice faster. Remember longer.</h2>
                            <p className="mt-2 text-gray-600">Short, focused quizzes with smart distractors and clear study paths. Track what you learn and revisit weak items.</p>

                            <div className="mt-4 flex gap-2 flex-wrap">
                                {isFeatureUnlocked() ? (
                                    <>
                                        <Link to="/ows" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow text-sm">One Word Substitution</Link>
                                        <Link to="/iph" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/60 shadow text-sm">Idioms & Phrases</Link>
                                        <Link to="/synonyms" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm">Synonyms</Link>
                                        <Link to="/antonyms" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm">Antonyms</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/payment?plan=6months#subscription-plans" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow text-sm hover:bg-gray-50">One Word Substitution 🔒</Link>
                                        <Link to="/payment?plan=6months#subscription-plans" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/60 shadow text-sm hover:bg-gray-50">Idioms & Phrases 🔒</Link>
                                        <Link to="/payment?plan=6months#subscription-plans" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm hover:bg-gray-50">Synonyms 🔒</Link>
                                        <Link to="/payment?plan=6months#subscription-plans" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm hover:bg-gray-50">Antonyms 🔒</Link>
                                    </>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">A–Z</div>
                                <div className="px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">200+ Free Words</div>
                                <div className="px-3 py-2 rounded-full bg-yellow-50 text-yellow-700 text-sm font-semibold">Daily WOTD</div>
                            </div>
                        </div>

                        {/* WOTD card - full width, truncation for long text on small screens */}
                        <aside id="wotd-card" className="w-full p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg border border-indigo-100">
                            {wotd ? (
                                <div id="wotd-content" aria-live="polite">
                                    <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">Word of the Day</div>
                                    <div id="wotd-word" className="text-2xl font-bold text-gray-900 mb-2">{wotd.word}</div>
                                    {wotd.pos && <div id="wotd-pos" className="text-sm font-medium text-indigo-600 italic mb-3">{wotd.pos}</div>}
                                    <div id="wotd-meaning" className="text-base text-gray-700 font-medium leading-relaxed mb-4">{wotd.definition}</div>
                                    
                                    {/* Synonyms and Antonyms */}
                                    {(wotd.synonyms?.length > 0 || wotd.antonyms?.length > 0) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {wotd.synonyms?.length > 0 && (
                                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="text-sm font-bold text-green-700 mb-2">Synonyms:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {wotd.synonyms.map((syn, idx) => (
                                                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
                                                                {syn}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {wotd.antonyms?.length > 0 && (
                                                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <div className="text-sm font-bold text-red-700 mb-2">Antonyms:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {wotd.antonyms.map((ant, idx) => (
                                                            <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full border border-red-200">
                                                                {ant}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={(e) => {
                                                handleAddToPractice(wotd)
                                                const btn = e.currentTarget
                                                btn.classList.add('scale-95')
                                                setTimeout(() => btn.classList.remove('scale-95'), 150)
                                            }}
                                            className="w-full sm:flex-1 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-transform duration-150"
                                        >
                                            Add to Practice
                                        </button>
                                        {user && (
                                            <button
                                                onClick={(e) => {
                                                    const btn = e.currentTarget
                                                    btn.textContent = 'Marked'
                                                    btn.classList.add('bg-green-100', 'border-green-300', 'text-green-800')
                                                    handleMarkKnown(wotd.word)
                                                }}
                                                className={`w-full sm:w-auto px-3 py-2 rounded-md border transition-colors ${knownWords.has(wotd.word)
                                                        ? 'bg-green-100 border-green-300 text-green-800'
                                                        : 'hover:bg-gray-50'
                                                    }`}
                                                disabled={knownWords.has(wotd.word)}
                                            >
                                                {knownWords.has(wotd.word) ? 'Known' : 'Mark Known'}
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-3 text-xs text-gray-600">Tip: click "Add to Practice" to include this word in your next Quick 10 session.</div>
                                </div>
                            ) : (
                                <div id="wotd-loading" className="text-sm text-gray-600">Loading Word of the Day…</div>
                            )}
                        </aside>
                    </div>
                </header>

                {/* MAIN: grid that collapses to a single column on small screens */}
                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* One-Word Substitution */}
                            <div className="p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition w-full flex flex-col items-center gap-3 relative">
                                {!isFeatureUnlocked() && (
                                    <div className="absolute top-4 right-4">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                )}

                                <div className="w-full h-36 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden">
                                    <svg role="img" aria-label="book icon" className="w-16 h-16 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5v-11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 8h8M8 12h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="w-full text-center">
                                    <h3 className="text-lg font-semibold truncate">One-Word Substitution</h3>
                                    <p className="mt-1 text-sm text-gray-600">Full A→Z list with adaptive quizzes and same-letter distractors.</p>
                                    <div className="mt-2 text-xs font-medium">
                                        {isFeatureUnlocked() ? (
                                            <span className="text-green-600">✓ Unlocked</span>
                                        ) : (
                                            <span className="text-orange-600">🔒 Requires Any Plan</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {isFeatureUnlocked() ? (
                                        <Link to="/ows">
                                            <button className="w-full px-4 py-2 mt-2 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow hover:from-indigo-700 hover:to-indigo-800 transition">
                                                Start Practice
                                            </button>
                                        </Link>
                                    ) : (
                                        <Link to="/payment?plan=6months">
                                            <button className="w-full px-4 py-2 mt-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition">
                                                Unlock Now
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Idioms & Phrases */}
                            <div className="p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition w-full flex flex-col items-center gap-3 relative">
                                {!isFeatureUnlocked() && (
                                    <div className="absolute top-4 right-4">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                )}

                                <div className="w-full h-36 rounded-lg bg-yellow-50 flex items-center justify-center overflow-hidden">
                                    <svg role="img" aria-label="speech bubbles icon" className="w-16 h-16 text-yellow-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 15a2 2 0 0 1-2 2H9l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 8h10M7 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="w-full text-center">
                                    <h3 className="text-lg font-semibold truncate">Idioms & Phrases</h3>
                                    <p className="mt-1 text-sm text-gray-600">Phrase meanings, contextual usage, and practice tests.</p>
                                    <div className="mt-2 text-xs font-medium">
                                        {isFeatureUnlocked() ? (
                                            <span className="text-green-600">✓ Unlocked</span>
                                        ) : (
                                            <span className="text-orange-600">🔒 Requires Any Plan</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {isFeatureUnlocked() ? (
                                        <Link to="/iph">
                                            <button className="w-full px-4 py-2 mt-2 rounded-md bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow hover:from-green-700 hover:to-green-800 transition">
                                                Start Practice
                                            </button>
                                        </Link>
                                    ) : (
                                        <Link to="/payment?plan=6months">
                                            <button className="w-full px-4 py-2 mt-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition">
                                                Unlock Now
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Premium Plan Features */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div className="p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition w-full flex flex-col items-center gap-3 relative">
                                    {!isFeatureUnlocked() && (
                                        <div className="absolute top-4 right-4">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="w-full h-36 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden">
                                        <svg role="img" aria-label="synonyms" className="w-16 h-16 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="w-full text-center">
                                        <h3 className="text-lg font-semibold truncate">Synonyms</h3>
                                        <p className="mt-1 text-sm text-gray-600">Expand your vocabulary with word alternatives.</p>
                                        <div className="mt-2 text-xs font-medium">
                                            {isFeatureUnlocked() ? (
                                                <span className="text-green-600">✓ Unlocked</span>
                                            ) : (
                                                <span className="text-orange-600">🔒 Requires Any Plan</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {isFeatureUnlocked() ? (
                                            <Link to="/synonyms">
                                                <button className="w-full px-4 py-2 mt-2 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow hover:from-indigo-700 hover:to-indigo-800 transition">
                                                    Start Practice
                                                </button>
                                            </Link>
                                        ) : (
                                            <Link to="/payment?plan=6months">
                                                <button className="w-full px-4 py-2 mt-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition">
                                                    Unlock Now
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition w-full flex flex-col items-center gap-3 relative">
                                    {!isFeatureUnlocked() && (
                                        <div className="absolute top-4 right-4">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="w-full h-36 rounded-lg bg-pink-50 flex items-center justify-center overflow-hidden">
                                        <svg role="img" aria-label="antonyms" className="w-16 h-16 text-pink-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="w-full text-center">
                                        <h3 className="text-lg font-semibold truncate">Antonyms</h3>
                                        <p className="mt-1 text-sm text-gray-600">Learn opposite meanings and expand your vocabulary.</p>
                                        <div className="mt-2 text-xs font-medium">
                                            {isFeatureUnlocked() ? (
                                                <span className="text-green-600">✓ Unlocked</span>
                                            ) : (
                                                <span className="text-orange-600">🔒 Requires Any Plan</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {isFeatureUnlocked() ? (
                                            <Link to="/antonyms">
                                                <button className="w-full px-4 py-2 mt-2 rounded-md bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold shadow hover:from-pink-700 hover:to-pink-800 transition">
                                                    Start Practice
                                                </button>
                                            </Link>
                                        ) : (
                                            <Link to="/payment?plan=6months">
                                                <button className="w-full px-4 py-2 mt-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition">
                                                    Unlock Now
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="rounded-2xl p-5 bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold">Suggested: Quick 20 </h3>
                                <p className="mt-1 text-sm text-gray-600">A short 10-question quiz focused on words you marked 'weak' or random picks from the full list.</p>
                            </div>
                            <div className="flex items-center gap-5 w-full sm:w-auto">
                                <div className="px-8 py-3 rounded-full w-auto bg-red-50 text-red-700 text-sm">Test</div>
                                <button
                                    onClick={handleStartQuickQuiz}
                                    className="w-full sm:w-auto px-8 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    Start
                                </button>
                            </div>
                        </div> */}
                    </div>

                    {/* SIDEBAR: practice queue, overview, tips */}
                    <aside className="space-y-6">
                        <div className="rounded-2xl p-4 bg-white shadow-sm">
                            <h4 className="text-sm text-gray-600">Overview</h4>
                            <div className="mt-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                                        <div className="text-2xl font-bold text-amber-700">{overview.ows || 0}</div>
                                        <div className="text-xs text-amber-600 font-medium">One-Word Substitutions</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                                        <div className="text-2xl font-bold text-yellow-700">{overview.iph || 0}</div>
                                        <div className="text-xs text-yellow-600 font-medium">Idioms & Phrases</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                                        <div className="text-2xl font-bold text-indigo-700">{overview.synonyms || 0}</div>
                                        <div className="text-xs text-indigo-600 font-medium">Synonyms</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-pink-50 border border-pink-100">
                                        <div className="text-2xl font-bold text-pink-700">{overview.antonyms || 0}</div>
                                        <div className="text-xs text-pink-600 font-medium">Antonyms</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-gray-700">{(overview.ows || 0) + (overview.iph || 0) + (overview.synonyms || 0) + (overview.antonyms || 0)}</div>
                                        <div className="text-xs text-gray-500 font-medium">Total Vocabulary Items</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="practice-queue-card" className="rounded-2xl p-4 bg-white shadow-sm">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm text-gray-600">Practice Queue</h4>
                                {practiceQueue.length > 0 && (
                                    <button
                                        onClick={handleClearQueue}
                                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div id="practice-queue-list" className="mt-3 text-sm">
                                {practiceQueue.length === 0 ? (
                                    <div className="text-gray-500">No items in practice queue</div>
                                ) : (
                                    practiceQueue.slice(0, 5).map((item, index) => (
                                        <div key={index} className="py-1 text-gray-700">
                                            {item.word} - {item.definition}
                                        </div>
                                    ))
                                )}
                                {practiceQueue.length > 5 && (
                                    <div className="text-xs text-gray-500 mt-2">
                                        +{practiceQueue.length - 5} more items
                                    </div>
                                )}
                            </div>

                            {practiceQueue.length > 0 && (
                                <div className="mt-4">
                                    <button
                                        onClick={handleStartPracticeQuiz}
                                        className="w-full px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        Start Practice
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Subscription Status Display */}
                        {user && userSubscription && (
                            <div className={`rounded-2xl p-4 shadow-sm ${
                                userSubscription.status === 'active' 
                                    ? userSubscription.remainingDays <= 2 
                                        ? 'bg-red-50 border border-red-200' 
                                        : 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50 border border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-gray-800">Your Plan</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        userSubscription.status === 'active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : userSubscription.status === 'expired'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {userSubscription.status === 'active' ? 'Active' : 
                                         userSubscription.status === 'expired' ? 'Expired' : 'Inactive'}
                                    </span>
                                </div>
                                
                                {userSubscription.status === 'active' ? (
                                    <div>
                                        <p className="text-sm text-gray-700 mb-1">
                                            <span className="font-medium">{userSubscription.planName || userSubscription.currentPlan || 'Premium Plan'}</span>
                                        </p>
                                        <p className={`text-sm font-medium ${
                                            userSubscription.remainingDays <= 2 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {userSubscription.remainingDays} days remaining
                                        </p>
                                        {userSubscription.remainingDays <= 2 && (
                                            <p className="text-xs text-red-500 mt-1">
                                                ⚠️ Your subscription expires soon! Renew to continue accessing premium features.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {userSubscription.status === 'expired' 
                                                ? 'Your subscription has expired. Renew to access all features.' 
                                                : 'No active subscription. Upgrade to unlock premium features.'}
                                        </p>
                                        <Link 
                                            to="#subscription-plans"
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                            onClick={() => document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' })}
                                        >
                                            View Plans →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="rounded-2xl p-4 bg-white shadow-sm">
                            <h4 className="text-sm text-gray-600">Study Tips</h4>
                            <ul className="mt-3 text-sm text-gray-600 space-y-2">
                                <li>Practice daily for 10–15 minutes.</li>
                                <li>Review mistakes immediately after a session.</li>
                                <li>Use "Quick 20" for focused spaced repetition.</li>
                            </ul>
                        </div>
                    </aside>
                </section>

                {/* ENHANCED SUBSCRIPTION PLANS */}
                <section id="subscription-plans" className="mt-12 px-2 sm:px-0">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Choose Your Perfect Plan
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Unlock unlimited vocabulary learning with premium features and advanced quizzes
                            {!user && <span className="block mt-2 text-sm">Sign up to access all features!</span>}
                        </p>
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800 font-medium text-center">
                                💡 <strong>Smart Plan Stacking:</strong> Purchase multiple plans to extend your subscription! New plans add days to your existing subscription period.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                        {/* 7 Days Trial */}
                        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                                    🔥 Trial Plan
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">7 Days Trial</h3>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-gray-900">₹1</span>
                                    <span className="text-lg text-gray-500 line-through ml-2">₹49</span>
                                </div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-6 inline-block">
                                    98% OFF
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Access to all basic features
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        One-Word Substitutions
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Idioms & Phrases
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Daily Word of the Day
                                    </li>
                                </ul>
                                <Link to="/payment?plan=trial">
                                    <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg">
                                        Start Trial
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* 3 Months Plan */}
                        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                                    🎯 Popular Choice
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3 Months Plan</h3>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-gray-900">₹129</span>
                                    <span className="text-lg text-gray-500 line-through ml-2">₹299</span>
                                </div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-6 inline-block">
                                    57% OFF
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        All Premium Features
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        3 Months Full Access
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Advanced Quiz System
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Priority Email Support
                                    </li>
                                </ul>
                                <Link to="/payment?plan=3months">
                                    <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg">
                                        Choose Plan
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* 6 Months Plan - Most Popular */}
                        <div className="relative bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-300 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
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
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block mt-2">
                                    ⭐ Best Value
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">6 Months Plan</h3>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-gray-900">₹219</span>
                                    <span className="text-lg text-gray-500 line-through ml-2">₹499</span>
                                </div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-6 inline-block">
                                    56% OFF
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        All Premium Features
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Synonyms & Antonyms
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Advanced Quiz System
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Priority Support
                                    </li>
                                </ul>
                                <Link to="/payment?plan=6months">
                                    <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg">
                                        Get Premium
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* 12 Months Plan */}
                        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                                    💎 Best Value
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">12 Months Plan</h3>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-gray-900">₹349</span>
                                    <span className="text-lg text-gray-500 line-through ml-2">₹699</span>
                                </div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-6 inline-block">
                                    50% OFF
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        All Premium Features
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        12 Months Full Access
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Exclusive Study Materials
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        30-Day Money Back Guarantee
                                    </li>
                                </ul>
                                <Link to="/payment?plan=1year">
                                    <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg">
                                        Best Value
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Psychology-based purchase motivators */}
                    <div className="mt-8 text-center">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold mb-3">Why Choose BrainMesh Vocabulary?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <p className="font-medium">Scientifically Proven</p>
                                    <p className="text-gray-600">Spaced repetition for better retention.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="font-medium">Black Book</p>
                                    <p className="text-gray-600">All the vocabulary is taken from the Black Book and is specialized for the ( SSC Examinations )</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <p className="font-medium">Comprehensive Content</p>
                                    <p className="text-gray-600">4000+ words and growing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Quiz Modal
                {showQuickQuiz && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold mb-4">Quick 20 (OWS)</h3>
                            <p className="text-gray-600 mb-6">Take a 20-question quiz from One-Word Substitutions, randomly selected.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowQuickQuiz(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowQuickQuiz(false)
                                        window.location.href = '/quiz?type=ows&random=1&pageSize=20'
                                    }}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Start Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Practice Quiz Modal */}
                {showPracticeQuiz && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold mb-4">Practice Quiz</h3>
                            <p className="text-gray-600 mb-6">Quiz yourself on the words you've added to your practice queue ({practiceQueue.length} items).</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPracticeQuiz(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPracticeQuiz(false)
                                        window.location.href = '/quiz?type=practice'
                                    }}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Start Practice
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </main>
            </div>
            {/* Footer */}
            <footer className="mt-16 py-8 bg-white/60 backdrop-blur-sm">
                <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="rounded-lg p-2 bg-white/80 shadow-sm">
                                    <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 12c0 4 4 8 8 8s8-4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 4v8l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold">BrainMesh</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Master vocabulary with scientifically designed learning paths. Specialized content for SSC examinations from the Black Book series.
                            </p>
                            <div className="flex space-x-4 text-sm">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">4000+ Words</span>
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full">SSC Focused</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link to="/ows" className="hover:text-indigo-600 transition-colors">One-Word Substitutions</Link></li>
                                <li><Link to="/iph" className="hover:text-indigo-600 transition-colors">Idioms & Phrases</Link></li>
                                <li><Link to="/synonyms" className="hover:text-indigo-600 transition-colors">Synonyms</Link></li>
                                <li><Link to="/antonyms" className="hover:text-indigo-600 transition-colors">Antonyms</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link to="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms-conditions" className="hover:text-indigo-600 transition-colors">Terms & Conditions</Link></li>
                                <li><Link to="/refund-policy" className="hover:text-indigo-600 transition-colors">Refund Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-600">
                            &copy; {new Date().getFullYear()} BrainMesh. All rights reserved.
                        </p>
                        <div className="mt-4 md:mt-0 flex space-x-6 text-sm text-gray-600">
                            <span>Made for SSC Aspirants</span>
                            <span>•</span>
                            <span>Black Book Vocabulary</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
