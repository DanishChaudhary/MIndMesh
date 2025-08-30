import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function Quiz({ user }) {
    const [searchParams] = useSearchParams()
    const [questions, setQuestions] = useState([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [submitted, setSubmitted] = useState({})
    const [score, setScore] = useState({ correct: 0, incorrect: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quizStarted, setQuizStarted] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const letter = searchParams.get('letter') || 'A'
    const type = searchParams.get('type') || 'ows'
    const page = searchParams.get('page') || 1
    const pageSize = searchParams.get('pageSize') || 100
    const random = searchParams.get('random') || ''

    // Gate non-free quizzes for unauthenticated users and prevent unauthorized access
    const isFreeQuiz = type === 'freequiz' || type === 'free' || type === 'practice' || random
    
    if (!user && !isFreeQuiz) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <p className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-3 inline-block">Please login to access quizzes.</p>
                    <div className="mt-4">
                        <Link to="/login" state={{ msg: 'Please login to continue', next: window.location.pathname + window.location.search }} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Login</Link>
                    </div>
                </div>
            </div>
        )
    }

    // For authenticated users, check subscription for premium content
    if (user && !isFreeQuiz) {
        const userPlans = user.subscription?.plans || []
        const hasValidSubscription = userPlans.includes('trial') || userPlans.includes('3months') || userPlans.includes('6months') || userPlans.includes('1year')
        
        if (!hasValidSubscription) {
            return (
                <div className="max-w-4xl mx-auto p-6">
                    <div className="text-center py-8">
                        <p className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-3 inline-block">This content requires a subscription. Please upgrade to access all letters and quiz types.</p>
                        <div className="mt-4">
                            <Link to="/#pricing" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mr-2">Upgrade Now</Link>
                            <Link to="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Back to Home</Link>
                        </div>
                    </div>
                </div>
            )
        }
    }

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true)
                
                // Check if user has subscription for non-free quizzes
                if (type !== 'free' && type !== 'freequiz' && type !== 'wotd' && type !== 'practice') {
                    if (!user) {
                        setError('Please log in to access quizzes')
                        setLoading(false)
                        return
                    }
                    
                    // Check if user has subscription - check both hasActiveSubscription and subscription object
                    const hasSubscription = user.hasActiveSubscription || 
                                           (user.subscription && user.subscription.plans && user.subscription.plans.length > 0);
                    
                    if (!hasSubscription) {
                        setError('subscription_required')
                        setLoading(false)
                        return
                    }
                }

                let url = `/api/quiz/generate?type=${type}`
                
                if (type === 'free') {
                    // Use dedicated free quiz endpoint
                    url = '/api/quiz/free'
                } else if (type === 'synonyms') {
                    // Use new synonyms quiz endpoint with tracking
                    // Get stored word attempts from localStorage
                    const storedAttempts = localStorage.getItem('synonymsWordAttempts')
                    const wordAttemptsParam = storedAttempts ? `&wordAttempts=${encodeURIComponent(storedAttempts)}` : ''
                    url = `/api/quiz/synonyms?userId=${user?.id || 'anonymous'}&letter=${letter}${wordAttemptsParam}`
                } else if (type === 'antonyms') {
                    // Use new antonyms quiz endpoint with tracking
                    // Get stored word attempts from localStorage
                    const storedAttempts = localStorage.getItem('antonymsWordAttempts')
                    const wordAttemptsParam = storedAttempts ? `&wordAttempts=${encodeURIComponent(storedAttempts)}` : ''
                    url = `/api/quiz/antonyms?userId=${user?.id || 'anonymous'}&letter=${letter}${wordAttemptsParam}`
                } else if (type === '200synonyms' || type === 'top200synonyms') {
                    // Use new 200synonyms quiz endpoint with tracking
                    const storedAttempts = localStorage.getItem('200synonymsWordAttempts')
                    const wordAttemptsParam = storedAttempts ? `&wordAttempts=${encodeURIComponent(storedAttempts)}` : ''
                    url = `/api/quiz/200synonyms?userId=${user?.id || 'anonymous'}${wordAttemptsParam}`
                } else if (type === '200antonyms' || type === 'top200antonyms') {
                    // Use new 200antonyms quiz endpoint with tracking
                    const storedAttempts = localStorage.getItem('200antonymsWordAttempts')
                    const wordAttemptsParam = storedAttempts ? `&wordAttempts=${encodeURIComponent(storedAttempts)}` : ''
                    url = `/api/quiz/200antonyms?userId=${user?.id || 'anonymous'}${wordAttemptsParam}`
                } else if (type === 'freequiz') {
                    // For freequiz, use pageSize parameter
                    url += `&pageSize=${pageSize || 150}`
                } else if (type.startsWith('top200')) {
                    // Top200 quizzes don't need letter parameter
                    url += `&random=1`
                } else if (type === 'wotd') {
                    // WOTD quiz doesn't need additional parameters
                } else if (type === 'practice') {
                    // Practice quiz uses localStorage data, no API call needed
                    url = null
                } else {
                    // Regular letter-based quizzes
                    url += `&letter=${letter}&page=${page}&pageSize=${pageSize}`
                    if (random) url += `&random=1`
                }

                if (type === 'practice') {
                    // Get practice queue from localStorage
                    const practiceItems = JSON.parse(localStorage.getItem('practiceQueue') || '[]')
                    if (!practiceItems || practiceItems.length === 0) {
                        setError('No items in practice queue. Add some words first!')
                        setLoading(false)
                        return
                    }
                    
                    // Transform practice queue data to quiz format
                    const practiceData = practiceItems.map(item => {
                        // Generate options for practice quiz
                        const allWords = practiceItems.map(d => d.word || d.phrase).filter(w => w);
                        if (allWords.length < 4) {
                            // Not enough words for multiple choice, add some defaults
                            const defaultWords = ['Example', 'Sample', 'Test', 'Demo'];
                            allWords.push(...defaultWords);
                        }
                        
                        const correctAnswer = item.word || item.phrase;
                        const distractors = allWords
                            .filter(w => w !== correctAnswer)
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 3);
                        const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
                        
                        return {
                            word: item.word,
                            phrase: item.phrase,
                            definition: item.definition || item.meaning || 'No definition available',
                            options: options,
                            correctAnswer: correctAnswer,
                            prompt: item.definition || item.meaning || 'No definition available'
                        };
                    })
                    setQuestions(practiceData)
                } else {
                    const response = await axios.get(url, { withCredentials: true })
                    setQuestions(response.data.questions || [])
                    
                    // Store word attempts for synonyms/antonyms quiz persistence
                    if (type === 'synonyms' && response.data.wordAttempts) {
                        localStorage.setItem('synonymsWordAttempts', JSON.stringify(response.data.wordAttempts))
                    }
                    if (type === 'antonyms' && response.data.wordAttempts) {
                        localStorage.setItem('antonymsWordAttempts', JSON.stringify(response.data.wordAttempts))
                    }
                    if ((type === '200synonyms' || type === 'top200synonyms') && response.data.wordAttempts) {
                        localStorage.setItem('200synonymsWordAttempts', JSON.stringify(response.data.wordAttempts))
                    }
                    if ((type === '200antonyms' || type === 'top200antonyms') && response.data.wordAttempts) {
                        localStorage.setItem('200antonymsWordAttempts', JSON.stringify(response.data.wordAttempts))
                    }
                }
                
            } catch (err) {
                console.error('Failed to fetch quiz:', err)
                setError('Failed to load quiz')
            } finally {
                setLoading(false)
            }
        }

        if ((letter && type) || type === 'practice' || type === 'free' || type === 'wotd' || type.startsWith('top200')) {
            fetchQuiz()
        }
    }, [type, letter, page, pageSize, random, user])

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        if (submitted[questionIndex]) return

        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }))
    }

    const handleStartQuiz = () => {
        setQuizStarted(true)
    }

    const handleSubmit = () => {
        const currentAnswer = selectedAnswers[currentQuestion]

        if (currentAnswer === undefined) {
            // Show feedback for no answer selected
            return
        }

        if (submitted[currentQuestion]) {
            return // already submitted for this item
        }

        // Mark answer as submitted
        setSubmitted(prev => ({
            ...prev,
            [currentQuestion]: true
        }))

        // Check if answer is correct
        const currentQ = questions[currentQuestion]
        // Use correctAnswer from server response if available, otherwise fallback to type-based logic
        let correctAnswer = currentQ.correctAnswer
        if (!correctAnswer) {
            if (type === 'ows' || type === 'top200ows' || type === 'freequiz' || type === 'free') {
                correctAnswer = currentQ.word
            } else if (type === 'synonyms' || type === 'top200synonyms') {
                correctAnswer = currentQ.synonym
            } else if (type === 'antonyms' || type === 'top200antonyms') {
                correctAnswer = currentQ.antonym
            } else {
                correctAnswer = currentQ.phrase
            }
        }
        const selectedAnswer = currentQ.options[currentAnswer]
        const isCorrect = selectedAnswer === correctAnswer

        // Update score
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1)
        }))

        // Auto-advance to next question after a short delay if not last question
        if (currentQuestion < questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestion(prev => prev + 1)
            }, 1200)
        } else {
            // If on the last question, show results after a delay
            setTimeout(() => {
                setShowResults(true)
            }, 1200)
        }
    }

    const saveQuizResult = async () => {
        try {
            await axios.post('/api/quiz/submit', {
                letter,
                type,
                score: score.correct,
                total: questions.length,
                answers: selectedAnswers
            })
        } catch (err) {
            console.error('Failed to save quiz result:', err)
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading quiz...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <Link to="/" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <p className="text-gray-600">No questions available for this quiz.</p>
                    <Link to="/" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    const getQuizTitle = () => {
        if (type === 'wotd') return 'Word of the Day Quiz'
        if (type === 'practice') return 'Practice Quiz'
        if (type === 'free' || type === 'freequiz') return 'Free Sample Quiz - Top 200 OWS'
        if (type === 'top200ows') return 'Top 200 OWS Quiz (Most Repeated)'
        if (type === 'top200iph') return 'Top 200 IPH Quiz (Most Repeated)'
        if (type === 'top200synonyms') return 'Top 200 Synonyms Quiz (Most Repeated)'
        if (type === 'top200antonyms') return 'Top 200 Antonyms Quiz (Most Repeated)'
        if (type === 'ows') return `OWS - Letter ${letter}`
        if (type === 'iph') return `IPH - Letter ${letter}`
        if (type === 'synonyms') return `Synonyms - Letter ${letter}`
        if (type === 'antonyms') return `Antonyms - Letter ${letter}`
        return 'Quiz'
    }

    if (!quizStarted) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <h1 className="text-3xl font-bold mb-4">{getQuizTitle()}</h1>
                    <p className="text-gray-600 mb-6">
                        {questions.length} questions • Test your knowledge
                    </p>
                    <button
                        onClick={handleStartQuiz}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg"
                    >
                        Start Quiz
                    </button>
                </div>
            </div>
        )
    }

    if (showResults) {
        const answered = Object.keys(submitted).length
        const correctCount = score.correct
        const percentage = Math.round((correctCount / questions.length) * 100)

        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <h1 className="text-3xl font-bold mb-4">Quiz Complete!</h1>
                    <div className="text-6xl font-bold text-indigo-600 mb-4">
                        {correctCount}/{questions.length}
                    </div>
                    <p className="text-gray-600 mb-6">
                        {percentage}% correct • {answered} answered of {questions.length}
                    </p>

                    <div className="mt-6 flex gap-4 justify-center">
                        <Link
                            to={`/vocab-${type === 'ows' ? 'ows' : type === 'iph' ? 'iph' : type === 'synonyms' ? 'synonyms' : 'antonyms'}/${letter}`}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Review Vocabulary
                        </Link>
                        <Link
                            to="/"
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            Back to Home
                        </Link>
                    </div>

                    {/* Detailed review */}
                    <div className="mt-8 text-left">
                        <h3 className="text-lg font-semibold mb-4">Detailed Review:</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {questions.map((question, index) => {
                                const answer = selectedAnswers[index]
                                const isSubmitted = submitted[index]
                                if (!isSubmitted) return null

                                // Use correctAnswer from server response if available, otherwise fallback to type-based logic
                                let correctAnswer = question.correctAnswer
                                let prompt = question.prompt
                                if (!correctAnswer) {
                                    if (type === 'ows' || type === 'top200ows' || type === 'freequiz' || type === 'free') {
                                        correctAnswer = question.word
                                        prompt = question.definition
                                    } else if (type === 'synonyms' || type === 'top200synonyms') {
                                        correctAnswer = question.synonym
                                        prompt = `What is a synonym for "${question.word}"? (${question.definition})`
                                    } else if (type === 'antonyms' || type === 'top200antonyms') {
                                        correctAnswer = question.antonym
                                        prompt = `What is an antonym for "${question.word}"? (${question.definition})`
                                    } else {
                                        correctAnswer = question.phrase
                                        prompt = question.meaning
                                    }
                                }
                                const selectedAnswer = answer !== undefined ? question.options[answer] : null
                                const isCorrect = selectedAnswer === correctAnswer

                                return (
                                    <div key={index} className={`p-3 rounded border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                        <div className="text-sm text-gray-600">{index + 1}. {prompt}</div>
                                        <div className="mt-1">
                                            <strong>Your answer:</strong> {selectedAnswer} {isCorrect ? '✅' : '❌'}
                                        </div>
                                        {!isCorrect && (
                                            <div className="text-sm text-green-700 mt-1">
                                                <strong>Correct answer:</strong> {correctAnswer}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const currentQ = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100
    const answeredCount = Object.keys(selectedAnswers).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-indigo-100 p-4 md:p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <a href="/" className="text-sm text-blue-600 hover:underline">← Home</a>

                <div id="card" className="mt-4 md:mt-6 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg transform transition hover:shadow-xl">
                    <div className="flex items-center justify-between header-container">
                        <div>
                            <h2 id="hdr" className="text-xl font-semibold">Quiz</h2>
                            <p id="sub" className="text-sm text-gray-500">
                                {(type.startsWith('top200') || type === 'freequiz' || type === 'free' || type === 'practice') ? '' : `Letter ${letter} `}
                                <span id="typeLbl">
                                    {type === 'freequiz' || type === 'free' ? 'FREE' :
                                     type === 'practice' ? 'PRACTICE' :
                                     type === 'ows' ? 'One Word Substitution' : 
                                     type === 'iph' ? 'Idioms & Phrases' :
                                     type === 'synonyms' ? 'Synonyms' : 
                                     type === 'antonyms' ? 'Antonyms' :
                                     type === 'top200ows' ? 'TOP 200 (Most Repeated) OWS' :
                                     type === 'top200iph' ? 'TOP 200 (Most Repeated) IPH' :
                                     type === 'top200synonyms' ? 'TOP 200 (Most Repeated) SYNONYMS' :
                                     type === 'top200antonyms' ? 'TOP 200 (Most Repeated) ANTONYMS' : type.toUpperCase()}
                                </span>
                            </p>
                        </div>
                        <div className="text-right progress-container">
                            <div id="progressWrap" className="w-48 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    id="progressBar"
                                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                                    style={{ width: `${Math.max(4, progress)}%` }}
                                ></div>
                            </div>
                            <div id="counter" className="text-xs text-gray-500 mt-1">
                                {answeredCount} answered · {currentQuestion + 1} / {questions.length}
                            </div>
                        </div>
                    </div>

                    <div id="questionArea" className="mt-4 md:mt-6 min-h-[120px] md:min-h-[140px]">
                        {currentQ && (
                            <div className="w-full">
                                <div className="text-sm text-gray-500 mb-2">
                                    Item {currentQuestion + 1} of {questions.length}
                                </div>
                                <div className="font-medium text-lg text-gray-800 mb-4">
                                    {(type === 'ows' || type === 'top200ows' || type === 'freequiz' || type === 'free') ? currentQ.definition : 
                                     (type === 'synonyms' || type === 'top200synonyms') ? `What is a synonym for "${currentQ.word}"? (${currentQ.definition})` :
                                     (type === 'antonyms' || type === 'top200antonyms') ? `What is an antonym for "${currentQ.word}"? (${currentQ.definition})` :
                                     (type === 'practice') ? (currentQ.prompt || currentQ.definition || currentQ.meaning || 'No definition available') :
                                     currentQ.meaning}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                                    {currentQ.options?.map((option, index) => {
                                        const isSelected = selectedAnswers[currentQuestion] === index
                                        const isSubmitted = submitted[currentQuestion]
                                        // Use correctAnswer from server response if available, otherwise fallback to type-based logic
                                        let correctAnswer = currentQ.correctAnswer
                                        if (!correctAnswer) {
                                            if (type === 'ows' || type === 'top200ows' || type === 'freequiz' || type === 'free') {
                                                correctAnswer = currentQ.word
                                            } else if (type === 'synonyms' || type === 'top200synonyms') {
                                                correctAnswer = currentQ.synonym
                                            } else if (type === 'antonyms' || type === 'top200antonyms') {
                                                correctAnswer = currentQ.antonym
                                            } else {
                                                correctAnswer = currentQ.phrase
                                            }
                                        }
                                        const isCorrect = option === correctAnswer

                                        let optionClasses = 'option p-3 text-left bg-white rounded shadow hover:scale-[1.01] transition transform text-sm md:text-base'

                                        if (isSubmitted) {
                                            if (option === correctAnswer) {
                                                optionClasses += ' correct-answer'
                                            }
                                            if (isSelected) {
                                                if (isCorrect) {
                                                    optionClasses += ' selected correct'
                                                } else {
                                                    optionClasses += ' selected incorrect'
                                                }
                                            }
                                        } else if (isSelected) {
                                            optionClasses += ' selected'
                                        }

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleAnswerSelect(currentQuestion, index)}
                                                disabled={isSubmitted}
                                                className={optionClasses}
                                                style={{ whiteSpace: 'normal' }}
                                                type="button"
                                                aria-pressed={isSelected ? 'true' : 'false'}
                                            >
                                                <span className="mr-3 font-medium">{String.fromCharCode(65 + index)}.</span>
                                                {option}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div id="feedbackArea" className="feedback-message hidden"></div>

                    <div className="score-indicator">
                        <span>Score: </span>
                        <span id="correctCount" className="score-correct">{score.correct}</span>
                        <span>correct, </span>
                        <span id="incorrectCount" className="score-incorrect">{score.incorrect}</span>
                        <span>incorrect</span>
                    </div>

                    <div className="mt-4 md:mt-6 flex items-center gap-3 button-container">
                        <div className="nav-buttons">
                            <button
                                id="prevBtn"
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                id="nextBtn"
                                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentQuestion === questions.length - 1}
                                className="px-3 py-2 md:px-4 md:py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <button
                            id="submitBtn"
                            onClick={handleSubmit}
                            className="px-3 py-2 md:px-4 md:py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm md:text-base ml-0 md:ml-auto"
                        >
                            Submit Answer
                        </button>
                    </div>

                    <div id="result" className="mt-4 md:mt-6 hidden"></div>
                </div>
            </div>

            <style jsx>{`
                .option {
                    transition: all 0.18s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    border: 1px solid rgba(31, 41, 55, 0.06);
                }
                .option.selected {
                    background-color: #eef2ff;
                    border: 2px solid #6366f1;
                    color: #1f2937;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(99,102,241,0.08);
                }
                .option.selected::after {
                    content: "✓";
                    font-weight: 700;
                    margin-left: 0.5rem;
                    color: #3730a3;
                }
                .option.selected.correct {
                    background-color: #d1fae5 !important;
                    border-color: #10b981 !important;
                    color: #065f46;
                    box-shadow: none;
                }
                .option.selected.incorrect {
                    background-color: #fee2e2 !important;
                    border-color: #ef4444 !important;
                    color: #7f1d1d;
                    box-shadow: none;
                }
                .option.correct-answer {
                    border: 2px solid #10b981 !important;
                }
                .score-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background-color: #f8fafc;
                    border-radius: 0.5rem;
                    font-weight: 500;
                }
                .score-correct {
                    color: #059669;
                }
                .score-incorrect {
                    color: #dc2626;
                }
                .feedback-message {
                    animation: fadeIn 0.5s ease;
                    margin-top: 1rem;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                }
                .feedback-correct {
                    background-color: #d1fae5;
                    color: #065f46;
                    border: 1px solid #a7f3d0;
                }
                .feedback-incorrect {
                    background-color: #fee2e2;
                    color: #7f1d1d;
                    border: 1px solid #fecaca;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @media (max-width: 640px) {
                    .header-container {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .progress-container {
                        margin-top: 1rem;
                        width: 100%;
                    }
                    #progressWrap {
                        width: 100% !important;
                    }
                    .button-container {
                        flex-direction: column;
                    }
                    .button-container .nav-buttons {
                        width: 100%;
                        display: flex;
                        gap: 0.5rem;
                    }
                    .button-container .nav-buttons button {
                        flex: 1;
                    }
                    .button-container button#submitBtn {
                        margin-top: 0.5rem;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}
