import React, { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function VocabSynonyms({ user }) {
    const { letter } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    const page = parseInt(searchParams.get('page')) || 1
    const pageSize = parseInt(searchParams.get('pageSize')) || 20
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const fetchVocab = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/api/vocab/synonyms/${letter}`, {
                    params: { page, pageSize }
                })
                setItems(response.data.items || [])
                setTotal(response.data.total || 0)
                setTotalPages(response.data.totalPages || 1)
            } catch (err) {
                setError('Failed to load synonym items')
                console.error('Error fetching synonyms:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchVocab()
    }, [letter, page, pageSize])

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage, pageSize })
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading synonyms...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    // Check subscription status
    const hasActiveSubscription = user && user.subscription && user.subscription.status === 'active' && 
                                 user.subscription.expiresAt && new Date() < new Date(user.subscription.expiresAt)
    
    if (!hasActiveSubscription) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center">
                            <div className="mb-6">
                                <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Premium Content</h2>
                                <p className="text-lg text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg p-4 inline-block">
                                    This content requires a subscription. Please upgrade to access all letters and quiz types.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link 
                                    to="/#subscription-plans" 
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md"
                                >
                                    Upgrade Now
                                </Link>
                                <Link 
                                    to="/" 
                                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link to="/synonyms" className="text-sm text-blue-600 mb-5 hover:underline inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Synonyms
                </Link>
                
                <div className="flex items-center justify-between mt-4 mb-4">
                    <h1 className="text-2xl font-bold">Synonyms - {letter}</h1>
                    <div className="text-sm text-gray-600">
                        Showing {items.length} of {total}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                    {items.length === 0 ? (
                        <div className="p-4 bg-white rounded shadow text-gray-500 col-span-2">
                            No synonym items found for this letter.
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="p-6 bg-white rounded shadow hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 mb-2">
                                            {item.word}
                                            <span className="text-indigo-600 mx-2">≈</span>
                                            <span className="text-indigo-700 font-medium">{item.synonymsText || item.synonym1 || item.synonym || 'No synonyms'}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {item.definition}
                                        </div>
                                    </div>
                                    <div className="pl-4 flex items-start hidden sm:flex">
                                        <Link 
                                            to={`/quiz?letter=${letter}&type=synonyms&page=${page}&pageSize=${pageSize}#q${item.word}`}
                                            className="px-3 py-2 text-sm border rounded hover:bg-gray-50 block sm:inline"
                                        >
                                            <i className="fa-solid fa-angles-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex gap-2 items-center">
                        {page > 1 ? (
                            <button 
                                onClick={() => handlePageChange(page - 1)}
                                className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
                            >
                                Prev
                            </button>
                        ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded">Prev</span>
                        )}

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                            if (p > totalPages) return null
                            
                            return p === page ? (
                                <span key={p} className="px-3 py-1 bg-blue-600 text-white rounded">
                                    {p}
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
                                >
                                    {p}
                                </button>
                            )
                        })}

                        {page < totalPages ? (
                            <button 
                                onClick={() => handlePageChange(page + 1)}
                                className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
                            >
                                Next
                            </button>
                        ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded">Next</span>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link 
                        to={`/quiz?letter=${letter}&type=synonyms`}
                        className="btn-accent px-4 py-3 rounded w-full sm:w-auto text-center bg-gradient-to-r from-indigo-700 to-indigo-500 text-white hover:from-indigo-800 hover:to-indigo-600 transition-all"
                    >
                        Quiz this letter
                    </Link>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    Tip: Use the pageSize parameter to adjust how many items per page. The "Quiz this page" uses only the visible items.
                </div>
            </div>
        </div>
    )
}
