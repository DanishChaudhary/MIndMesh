import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Iph() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredLetters, setFilteredLetters] = useState([])
    const navigate = useNavigate()

    // Generate A-Z letters
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

    useEffect(() => {
        if (searchTerm) {
            const filtered = letters.filter(letter =>
                letter.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredLetters(filtered)
        } else {
            setFilteredLetters(letters)
        }
    }, [searchTerm])

    const handleLetterClick = (letter) => {
        navigate(`/vocab-iph/${letter}`)
    }

    return (
        <div className="bg-gradient-to-br from-white via-yellow-50 to-yellow-100 min-h-screen text-gray-800">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <header className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Home
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-semibold mt-3">Idioms & Phrases</h1>
                        <p className="text-gray-600 mt-1 max-w-2xl">
                            Choose a letter (A → Z) to practice idioms and phrases. Cards are responsive and accessible on all devices.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/quiz?type=top200iph" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 transition-all">
                            Top200 IPH
                        </Link>
                    </div>
                </header>

                {/* Search + mobile scroller */}
                <div className="mb-4">
                    <div className="flex gap-3 items-center">
                        <div className="flex-1 relative">
                            <input
                                type="search"
                                placeholder="Search letters (type a letter like 'A')"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl bg-white shadow-sm border border-gray-100 pl-10 pr-4 py-3 focus:ring-0 focus:border-amber-300 focus:outline-none"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.65 3.65a7.5 7.5 0 0012.99 12.99z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Letters Grid */}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {filteredLetters.map((letter) => (
                        <button
                            key={letter}
                            onClick={() => handleLetterClick(letter)}
                            className="letter-card group focus-ring"
                        >
                            <div className="letter-badge group-hover:scale-105 transition-transform">
                                {letter}
                            </div>
                            <div className="card-meta">
                                <span className="text-sm font-medium text-gray-700">Practice</span>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Mobile Scroller */}
                <div className="mt-6 sm:hidden">
                    <div className="letters-scroller">
                        {letters.map((letter) => (
                            <button
                                key={letter}
                                onClick={() => handleLetterClick(letter)}
                                className="letter-badge text-sm"
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .letter-card {
                    border-radius: 14px;
                    padding: 0.9rem;
                    background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,250,240,0.98));
                    box-shadow: 0 6px 22px rgba(16,24,40,0.06);
                    transition: transform .22s cubic-bezier(.2,.9,.2,1), box-shadow .22s;
                    will-change: transform;
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }
                .letter-card:hover { 
                    transform: translateY(-6px); 
                    box-shadow: 0 18px 40px rgba(16,24,40,0.12); 
                }
                .letter-card:active { 
                    transform: translateY(-2px); 
                }
                .focus-ring:focus { 
                    outline: none; 
                    box-shadow: 0 0 0 6px rgba(245,158,11,0.12); 
                    transform: translateY(-4px); 
                }
                .letter-badge {
                    width: 56px; 
                    height: 56px; 
                    min-width: 56px;
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    border-radius: 12px; 
                    font-weight: 700; 
                    font-size: 1.15rem;
                    background: linear-gradient(135deg, rgba(245,158,11,0.07), rgba(212,121,6,0.04));
                    color: #b45309;
                }
                .card-meta { 
                    display: flex; 
                    align-items: center; 
                    gap: 0.6rem; 
                    justify-content: space-between; 
                }
                .letters-scroller {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding: 0.5rem 0;
                    -webkit-overflow-scrolling: touch;
                }
                .letters-scroller::-webkit-scrollbar { 
                    height: 8px; 
                }
                .letters-scroller::-webkit-scrollbar-thumb { 
                    background: rgba(0,0,0,0.12); 
                    border-radius: 999px; 
                }
                
                @media (max-width: 640px) {
                    .letter-badge { 
                        width: 48px; 
                        height: 48px; 
                        min-width: 48px; 
                        font-size: 1rem; 
                        border-radius: 10px; 
                    }
                }
            `}</style>
        </div>
    )
}
