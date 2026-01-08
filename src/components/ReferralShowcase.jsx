/**
 * ReferralShowcase Component
 * 
 * Displays referral program benefits and generates shareable links
 * 
 * TODO:
 * - Integrate with actual referral tracking system
 * - Add social sharing with pre-filled messages
 * - Track share → signup conversion rates
 * - Add leaderboard for top referrers
 * 
 * Priority: MEDIUM - Growth mechanic but not critical path
 */

import { useState, useEffect } from 'react'
import { trackReferralGenerated, trackScrollShare } from '../utils/analytics'

const ReferralShowcase = ({ userId = null }) => {
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareStats, setShareStats] = useState({ clicks: 0, signups: 0, earnings: 0 })

  useEffect(() => {
    // TODO: Fetch user's referral code from API
    const code = userId ? `REF-${userId.slice(0, 8)}` : 'REF-DEMO123'
    setReferralCode(code)

    // TODO: Fetch real referral stats
    setShareStats({
      clicks: 24,
      signups: 5,
      earnings: 850, // ZAR
    })
  }, [userId])

  const referralLink = `https://vauntico.com?ref=${referralCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    trackReferralGenerated(referralCode, 'manual_copy')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSocialShare = (platform) => {
    const messages = {
      twitter: `I'm building my creator empire with @Vauntico 🏰\n\nAI-powered content, mystical scrolls, and tools that actually scale.\n\nJoin me: ${referralLink}`,
      linkedin: `Vauntico is transforming how I create content. Worth checking out if you're a creator or agency.`,
      email: `Hey! I've been using Vauntico and thought you might find it useful. It's an AI-powered platform for creators. Check it out: ${referralLink}`,
    }

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=${encodeURIComponent('Check out Vauntico')}&body=${encodeURIComponent(messages.email)}`,
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
    trackScrollShare('referral', 'Referral Link', platform)
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="card bg-gradient-to-br from-vault-purple via-vault-blue to-vault-cyan text-white">
        <div className="text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-3xl font-bold mb-2">Share the Magic, Earn the Rewards</h2>
          <p className="text-lg opacity-90 mb-6">
            Get up to <span className="font-bold text-2xl">15% commission</span> on every referral
          </p>
        </div>

        {/* Referral Link Generator */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4">
          <label className="block text-sm font-semibold mb-2">Your Unique Referral Link</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-white text-gray-900 px-4 py-3 rounded-lg font-mono text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="bg-white text-vault-purple hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleSocialShare('twitter')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2"
          >
            <span>🐦</span>
            <span>Tweet</span>
          </button>
          <button
            onClick={() => handleSocialShare('linkedin')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2"
          >
            <span>💼</span>
            <span>LinkedIn</span>
          </button>
          <button
            onClick={() => handleSocialShare('email')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2"
          >
            <span>✉️</span>
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-2">👁️</div>
          <div className="text-3xl font-bold text-vault-purple mb-1">{shareStats.clicks}</div>
          <div className="text-gray-600">Link Clicks</div>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-3xl font-bold text-vault-purple mb-1">{shareStats.signups}</div>
          <div className="text-gray-600">Sign-ups</div>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-bold text-vault-purple mb-1">R{shareStats.earnings}</div>
          <div className="text-gray-600">Earned</div>
        </div>
      </div>

      {/* Commission Tiers */}
      <div className="card">
        <h3 className="text-2xl font-bold mb-4">Commission Structure</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                ⚔️
              </div>
              <div>
                <p className="font-bold">Starter Tier</p>
                <p className="text-sm text-gray-600">R299/month subscriptions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-vault-purple">5%</p>
              <p className="text-sm text-gray-500">R15/month</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-vault-purple">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center text-2xl">
                🏰
              </div>
              <div>
                <p className="font-bold">Pro Tier</p>
                <p className="text-sm text-gray-600">R999/month subscriptions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-vault-purple">10%</p>
              <p className="text-sm text-gray-500">R100/month</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-purple-50 rounded-lg border-2 border-yellow-400">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center text-2xl">
                👑
              </div>
              <div>
                <p className="font-bold">Legacy Tier</p>
                <p className="text-sm text-gray-600">R2999/month subscriptions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-vault-purple">15%</p>
              <p className="text-sm text-gray-500">R450/month</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-vault-purple/10 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>💡 Pro Tip:</strong> Referrals earn you recurring commission for as long as they stay subscribed!
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <h3 className="text-2xl font-bold mb-6">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-vault-purple/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              1️⃣
            </div>
            <h4 className="font-bold mb-2">Share Your Link</h4>
            <p className="text-sm text-gray-600">
              Post on social, email your network, or embed on your site
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-vault-purple/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              2️⃣
            </div>
            <h4 className="font-bold mb-2">They Subscribe</h4>
            <p className="text-sm text-gray-600">
              Your referrals get 10% off, you get credited
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-vault-purple/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              3️⃣
            </div>
            <h4 className="font-bold mb-2">Earn Monthly</h4>
            <p className="text-sm text-gray-600">
              Recurring commission paid out every month
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="card">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Top Referrers This Month
        </h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'Alex M.', referrals: 47, earnings: 12500, badge: '🥇' },
            { rank: 2, name: 'Sarah K.', referrals: 32, earnings: 8900, badge: '🥈' },
            { rank: 3, name: 'Marcus R.', referrals: 28, earnings: 7200, badge: '🥉' },
          ].map((leader) => (
            <div key={leader.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{leader.badge}</div>
                <div>
                  <p className="font-bold">{leader.name}</p>
                  <p className="text-sm text-gray-600">{leader.referrals} referrals</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-vault-purple text-lg">R{leader.earnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">this month</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReferralShowcase

/**
 * AUDIT TODO LIST:
 * 
 * 1. BACKEND INTEGRATION
 *    - [ ] Build referral tracking API
 *    - [ ] Implement unique code generation
 *    - [ ] Add commission payout system
 *    - [ ] Create admin dashboard for approval
 * 
 * 2. ANALYTICS
 *    - [ ] Track referral link performance by channel
 *    - [ ] Monitor conversion rates per referrer
 *    - [ ] Track time-to-conversion
 *    - [ ] Identify top-performing referral sources
 * 
 * 3. UX ENHANCEMENTS
 *    - [ ] Add custom referral code option
 *    - [ ] Create shareable image cards
 *    - [ ] Add email template builder
 *    - [ ] Implement A/B testing for share messages
 * 
 * 4. GAMIFICATION
 *    - [ ] Add referral milestones (5, 10, 25 referrals)
 *    - [ ] Create referral badges/achievements
 *    - [ ] Implement monthly contests
 *    - [ ] Add tier upgrades based on referrals
 * 
 * 5. FRAUD PREVENTION
 *    - [ ] Detect self-referrals
 *    - [ ] Monitor for suspicious patterns
 *    - [ ] Add manual review for high-value referrals
 *    - [ ] Implement rate limiting
 */
