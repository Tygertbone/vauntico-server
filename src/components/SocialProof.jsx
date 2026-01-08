function TrustBadges({ layout = 'horizontal' }) {
  const badges = [
    { icon: '🛡️', label: 'Bank-level Security' },
    { icon: '🔒', label: 'Privacy First' },
    { icon: '🌟', label: 'Top Rated' },
    { icon: '✨', label: 'Premium Quality' }
  ]

  if (layout === 'horizontal') {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {badges.map((badge, index) => (
          <div 
            key={index}
            className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
          >
            <span className="text-lg">{badge.icon}</span>
            <span className="text-sm text-gray-700">{badge.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <div 
          key={index}
          className="text-center"
        >
          <div className="text-3xl mb-2">{badge.icon}</div>
          <div className="text-sm text-gray-700">{badge.label}</div>
        </div>
      ))}
    </div>
  )
}

function ReviewStars({ rating = 4.8, reviewCount = 350 }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.096 6.223 13.564 1.567 8.561-6.34-1.406-6.58-1.181-.784 0H7.81c-1.324 0-2.555-.447-.894-1.179-.789-.403-.195-.807-2.236-3.079-2.75-4.285-5.715-6.533-8.144-8.866 2.051-1.181.725 5.715 2.051 4.285 8.144 8.866 12.051 13.181 14.775 16.051 12.051z" />
          </svg>
        ))}
      </div>
      <div>
        <div className="text-lg font-bold text-gray-900">{rating}</div>
        <div className="text-sm text-gray-600">({reviewCount} reviews)</div>
      </div>
    </div>
  )
}

function MoneyBackGuarantee({ days = 14 }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-2-4-2m6 2a9 9 0 013-6 0 013-6h3a3 3 0 013-6 0 013-6 3z" />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-green-800 mb-1">{days}-Day Money Back</h3>
          <p className="text-green-700">Try risk-free for {days} days</p>
        </div>
      </div>
    </div>
  )
}

export { TrustBadges, ReviewStars, MoneyBackGuarantee }
