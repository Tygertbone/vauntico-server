import React from 'react'

function PlatformCard({ name, icon, description, isConnected = false }) {
  const getPlatformColors = (platform) => {
    const colors = {
      YouTube: 'border-red-200 hover:shadow-red-100',
      'Google Analytics': 'border-blue-200 hover:shadow-blue-100',
      Substack: 'border-orange-200 hover:shadow-orange-100',
      Payments: 'border-green-200 hover:shadow-green-100'
    }
    return colors[platform] || 'border-gray-200 hover:shadow-gray-100'
  }

  return (
    <div className={`card text-center border-2 ${isConnected ? 'border-green-400 bg-green-50' : getPlatformColors(name)} hover:shadow-lg transition-all duration-300`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>

      {isConnected ? (
        <div className="flex items-center justify-center text-green-600 font-medium">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Connected
        </div>
      ) : (
        <button className="btn-outline text-sm px-4 py-2 w-full">
          Connect
        </button>
      )}
    </div>
  )
}

export default PlatformCard
