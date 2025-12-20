import { useState } from 'react'
import { Link } from 'react-router-dom'

function Referrals() {
  const [copied, setCopied] = useState(false)
  
  // Mock data - replace with real user data
  const referralCode = 'VAUNTICO-USER123'
  const referralLink = `https://vauntico.com/?ref=${referralCode}`
  const stats = {
    totalReferrals: 12,
    activeReferrals: 8,
    creditsEarned: 2400,
    pendingCredits: 800
  }

  const leaderboard = [
    { rank: 1, name: 'Sarah M.', referrals: 45, credits: 18000, badge: '🏆' },
    { rank: 2, name: 'Marcus R.', referrals: 38, credits: 15200, badge: '🥈' },
    { rank: 3, name: 'Jessica D.', referrals: 32, credits: 12800, badge: '🥉' },
    { rank: 4, name: 'You', referrals: 12, credits: 2400, badge: '⭐', isYou: true },
    { rank: 5, name: 'Alex K.', referrals: 11, credits: 2200, badge: '' },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Share Vauntico, <span className="text-gradient">Earn Rewards</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get 200 credits for every friend who joins. They get a bonus too. Win-win.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-4xl mb-2">{stats.totalReferrals}</div>
          <p className="text-gray-600 font-medium">Total Referrals</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2 text-green-600">{stats.activeReferrals}</div>
          <p className="text-gray-600 font-medium">Active Users</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2 text-vault-purple">{stats.creditsEarned}</div>
          <p className="text-gray-600 font-medium">Credits Earned</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2 text-vault-blue">{stats.pendingCredits}</div>
          <p className="text-gray-600 font-medium">Pending Credits</p>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="card mb-12 vault-gradient text-white">
        <h2 className="text-2xl font-bold mb-4">Your Referral Link</h2>
        <p className="mb-6 opacity-90">
          Share this link with friends. When they sign up and upgrade to Creator Pass, you both get 200 bonus credits.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 font-mono text-sm"
          />
          <button
            onClick={handleCopy}
            className="btn-secondary bg-white text-vault-purple hover:bg-gray-100 px-6"
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-bold mb-3">Share Your Link</h3>
            <p className="text-gray-600">
              Send your unique referral link via email, social media, or wherever your friends hang out.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-bold mb-3">They Sign Up</h3>
            <p className="text-gray-600">
              When they create an account using your link, they get 50 bonus credits to start.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-16 h-16 vault-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-bold mb-3">You Both Win</h3>
            <p className="text-gray-600">
              When they upgrade to Creator Pass, you both get 200 credits. Keep referring, keep earning.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Top Referrers This Month 🏆
        </h2>
        <div className="card">
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  user.isYou
                    ? 'bg-gradient-to-r from-vault-purple/20 to-vault-blue/20 border-2 border-vault-purple'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    #{user.rank}
                  </div>
                  <div className="text-3xl">{user.badge}</div>
                  <div>
                    <p className={`font-semibold ${user.isYou ? 'text-vault-purple' : ''}`}>
                      {user.name}
                      {user.isYou && <span className="ml-2 text-sm text-vault-purple">(You!)</span>}
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.referrals} referrals • {user.credits} credits
                    </p>
                  </div>
                </div>
                {user.rank <= 3 && (
                  <div className="text-right">
                    <p className="font-semibold text-vault-purple">
                      Winner Bonus
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.rank === 1 ? '5,000' : user.rank === 2 ? '3,000' : '1,500'} credits
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-600 mt-4">
          Top 3 referrers each month win bonus credits. Keep climbing! 📈
        </p>
      </div>

      {/* Reward Tiers */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Milestone Rewards</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card text-center bg-gradient-to-br from-gray-100 to-white">
            <div className="text-4xl mb-3">🥉</div>
            <h3 className="text-xl font-bold mb-2">5 Referrals</h3>
            <p className="text-gray-600 mb-3">Bronze Badge</p>
            <div className="text-2xl font-bold text-vault-purple">+500 credits</div>
          </div>
          <div className="card text-center bg-gradient-to-br from-blue-50 to-white">
            <div className="text-4xl mb-3">🥈</div>
            <h3 className="text-xl font-bold mb-2">15 Referrals</h3>
            <p className="text-gray-600 mb-3">Silver Badge</p>
            <div className="text-2xl font-bold text-vault-purple">+2,000 credits</div>
          </div>
          <div className="card text-center bg-gradient-to-br from-yellow-50 to-white">
            <div className="text-4xl mb-3">🥇</div>
            <h3 className="text-xl font-bold mb-2">30 Referrals</h3>
            <p className="text-gray-600 mb-3">Gold Badge</p>
            <div className="text-2xl font-bold text-vault-purple">+5,000 credits</div>
          </div>
          <div className="card text-center bg-gradient-to-br from-purple-50 to-white">
            <div className="text-4xl mb-3">💎</div>
            <h3 className="text-xl font-bold mb-2">50 Referrals</h3>
            <p className="text-gray-600 mb-3">Diamond Badge</p>
            <div className="text-2xl font-bold text-vault-purple">Free Creator Pass!</div>
          </div>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="card bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20 text-center">
        <h2 className="text-2xl font-bold mb-4">Quick Share</h2>
        <p className="text-gray-600 mb-6">
          Share on your favorite platform and start earning
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="btn-primary">
            Share on Twitter 🐦
          </button>
          <button className="btn-secondary">
            Share on LinkedIn 💼
          </button>
          <button className="btn-outline">
            Email Friends 📧
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Referral FAQ</h2>
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-2">When do I get my credits?</h3>
            <p className="text-gray-600">
              You receive 200 credits immediately when your referral upgrades to Creator Pass. Their payment must be successful.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Is there a limit to referrals?</h3>
            <p className="text-gray-600">
              No limit! Refer as many people as you want. Every successful referral earns you credits.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Can I refer myself or create fake accounts?</h3>
            <p className="text-gray-600">
              No. We actively monitor for fraud. Self-referrals and fake accounts will result in credit forfeiture and account suspension.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Referrals
