import React from 'react'

function Leaderboard() {
  // Mock data - replace with actual API call later
  const topCreators = [
    {
      id: 1,
      name: 'TechMaster2024',
      avatar: 'TM',
      score: 94,
      category: 'Tech Creator',
      change: '+2'
    },
    {
      id: 2,
      name: 'LifestylePro',
      avatar: 'LP',
      score: 91,
      category: 'Lifestyle Creator',
      change: '+1'
    },
    {
      id: 3,
      name: 'BizCoachElite',
      avatar: 'BC',
      score: 89,
      category: 'Business Coach',
      change: '+3'
    },
    {
      id: 4,
      name: 'FitnessInsider',
      avatar: 'FI',
      score: 87,
      category: 'Fitness Creator',
      change: '+1'
    },
    {
      id: 5,
      name: 'CookingMadeEasy',
      avatar: 'CE',
      score: 85,
      category: 'Food Creator',
      change: '+4'
    }
  ]

  const getScoreColor = (index) => {
    const colors = [
      'from-yellow-400 to-yellow-600', // Gold
      'from-gray-300 to-gray-500',     // Silver
      'from-amber-500 to-amber-700',   // Bronze
      'from-purple-400 to-purple-600', // Purple
      'from-blue-400 to-blue-600'      // Blue
    ]
    return colors[index] || 'from-gray-400 to-gray-600'
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold text-center">🏆 Creator Leaderboard</h2>
          <p className="text-center text-purple-100 mt-2">Top creators by Trust Score this month</p>
        </div>

        <div className="divide-y divide-gray-100">
          {topCreators.map((creator, index) => (
            <div key={creator.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getScoreColor(index)} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {creator.avatar}
                  </div>

                  {/* Creator Info */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{creator.name}</h3>
                    <p className="text-gray-600 text-sm">{creator.category}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className="text-3xl font-bold text-gray-900">{creator.score}</div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">💯</span>
                      <span className="text-xs text-green-500 font-medium">{creator.change}</span>
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="mt-2 w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getScoreColor(index)} transition-all duration-500`}
                      style={{ width: `${creator.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">
              Your position depends on your platform connections and performance
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
              Connect Platforms to Join →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
