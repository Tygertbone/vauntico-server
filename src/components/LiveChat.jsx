import { useState, useEffect } from 'react'

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: "Hi! 👋 I'm here to help with any questions about The R2,000 Challenge. What would you like to know?",
      timestamp: new Date()
    }
  ])

  const quickQuestions = [
    "📱 What apps do I need?",
    "💰 How does payment plan work?",
    "🛡️ Tell me about the guarantee",
    "🌍 Which countries supported?",
    "⏰ How much time per day?",
    "🎓 Is this for beginners?"
  ]

  const handleQuickQuestion = (question) => {
    // Add user message
    const userMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: question,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])

    // Simulate support response
    setTimeout(() => {
      const response = getAutoResponse(question)
      const supportMsg = {
        id: messages.length + 2,
        sender: 'support',
        text: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, supportMsg])
    }, 1000)

    // Track event
    if (window.VaunticoAnalytics && window.VaunticoAnalytics.trackEvent) {
      window.VaunticoAnalytics.trackEvent('live_chat_quick_question', {
        question: question
      })
    }
  }

  const getAutoResponse = (question) => {
    const responses = {
      "📱 What apps do I need?": "Just free apps! Canva (design), CapCut (video editing), and Google Docs (writing). All available on Android and iOS. No paid subscriptions needed! 🎉",
      "💰 How does payment plan work?": "Pay R333/month for 3 months (with exit offer discount) or R349/month without discount. First payment today, then auto-charge every 30 days. Cancel anytime! 💳",
      "🛡️ Tell me about the guarantee": "Simple: Follow the system for 60 days. If you don't make R2,000 in month 3, email us proof of work and we refund 100%. No hassle, no questions. 🛡️",
      "🌍 Which countries supported?": "Designed for South Africa 🇿🇦, Nigeria 🇳🇬, Kenya 🇰🇪, and Ghana 🇬🇭, but works anywhere! Payment via M-Pesa, MoMo, bank transfer, or card. 🌍",
      "⏰ How much time per day?": "Just 1 hour per day! You can split it: 30 mins in the morning, 30 mins at night. Perfect for busy people with jobs or school. ⏱️",
      "🎓 Is this for beginners?": "Absolutely! 90% of members started with 0 followers and no experience. We teach everything step-by-step, day-by-day. Just bring your phone! 📱"
    }
    return responses[question] || "Great question! Let me connect you with our WhatsApp support for a detailed answer. Click the button below! 💬"
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    const userMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setMessage('')

    // Auto-response for custom message
    setTimeout(() => {
      const supportMsg = {
        id: messages.length + 2,
        sender: 'support',
        text: "Thanks for your question! For detailed help, please join our WhatsApp community or email support@vauntico.com. We typically respond within 2 hours! 💬",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, supportMsg])
    }, 1500)
  }

  useEffect(() => {
    if (isOpen && window.VaunticoAnalytics && window.VaunticoAnalytics.trackEvent) {
      window.VaunticoAnalytics.trackEvent('live_chat_opened')
    }
  }, [isOpen])

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-green-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-110 z-50 animate-bounce"
          aria-label="Open Live Chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[600px] animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-green-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                💬
              </div>
              <div>
                <h3 className="font-bold">Ubuntu Support</h3>
                <p className="text-xs opacity-90">We're here to help! 🌍</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          <div className="p-4 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-semibold">Quick Questions:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full transition-colors border border-purple-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-600 to-green-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-center">
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:text-green-700 font-semibold"
              >
                💚 Chat on WhatsApp for instant help
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
