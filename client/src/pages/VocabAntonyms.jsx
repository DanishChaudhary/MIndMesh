import React, { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function VocabAntonyms() {
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
                const response = await axios.get(`/api/vocab/antonyms/${letter}`, {
                    params: { page, pageSize }
                })
                setItems(response.data.items || [])
                setTotal(response.data.total || 0)
                setTotalPages(response.data.totalPages || 1)
            } catch (err) {
                setError('Failed to load antonym items')
                console.error('Error fetching antonyms:', err)
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading antonyms...</p>
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
                        className="mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link to="/antonyms" className="text-sm text-blue-600 mb-5 hover:underline inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Antonyms
                </Link>
                
                <div className="flex items-center justify-between mt-4 mb-4">
                    <h1 className="text-2xl font-bold">Antonyms - {letter}</h1>
                    <div className="text-sm text-gray-600">
                        Showing {items.length} of {total}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                    {items.length === 0 ? (
                        <div className="p-4 bg-white rounded shadow text-gray-500 col-span-2">
                            No antonym items found for this letter.
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="p-6 bg-white rounded shadow hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 mb-2">
                                            {item.word}
                                            <span className="text-pink-600 mx-2">⇄</span>
                                            <span className="text-pink-700 font-medium">{item.antonymsText || item.antonym1 || item.antonym || 'No antonyms'}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {item.definition}
                                        </div>
                                    </div>
                                    <div className="pl-4 flex items-start hidden sm:flex">
                                        <Link 
                                            to={`/quiz?letter=${letter}&type=antonyms&page=${page}&pageSize=${pageSize}#q${item.word}`}
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
                        to={`/quiz?letter=${letter}&type=antonyms`}
                        className="btn-accent px-4 py-3 rounded w-full sm:w-auto text-center bg-gradient-to-r from-pink-700 to-pink-500 text-white hover:from-pink-800 hover:to-pink-600 transition-all"
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
