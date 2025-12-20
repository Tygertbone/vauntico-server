import { useState } from 'react'
import { 
  generateScrollShareLink, 
  shareOnTwitter, 
  shareOnLinkedIn, 
  copyShareLink,
  generateIframeEmbed,
  generatePreviewCard 
} from '../utils/syndication'

/**
 * Share Scroll Modal - Social sharing and embed generation
 * Phase 5: Syndication layer UI
 */

function ShareScrollModal({ scroll, onClose }) {
  const [activeTab, setActiveTab] = useState('social')
  const [copied, setCopied] = useState(false)
  const [embedOptions, setEmbedOptions] = useState({
    width: '100%',
    height: '600px',
    theme: 'light',
    showHeader: true
  })

  if (!scroll) return null

  const handleCopyLink = async () => {
    const result = await copyShareLink(scroll.id, scroll.title)
    if (result.success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareTwitter = () => {
    shareOnTwitter(scroll.id, scroll.title)
  }

  const handleShareLinkedIn = () => {
    shareOnLinkedIn(scroll.id, scroll.title)
  }

  const getEmbedCode = () => {
    if (activeTab === 'iframe') {
      return generateIframeEmbed(scroll.id, scroll.title, embedOptions).embedCode
    } else if (activeTab === 'preview') {
      return generatePreviewCard(
        scroll.id, 
        scroll.title, 
        scroll.description || 'Explore this scroll on Vauntico',
        scroll.tier || 'free'
      ).embedCode
    }
    return ''
  }

  const copyEmbedCode = async () => {
    const code = getEmbedCode()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareLink = generateScrollShareLink(scroll.id, scroll.title).url

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-vault-purple to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Share Scroll</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-purple-100 text-sm">{scroll.title}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {[
              { id: 'social', label: '🌐 Social Share', icon: '📱' },
              { id: 'iframe', label: '💻 Embed Code', icon: '🔗' },
              { id: 'preview', label: '🎨 Preview Card', icon: '📇' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${activeTab === tab.id 
                    ? 'border-b-2 border-vault-purple text-vault-purple bg-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Social Share Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition-all
                      ${copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-vault-purple text-white hover:bg-purple-700'
                      }
                    `}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Link includes your referral code for commission tracking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Share on Social Media
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                  >
                    <span className="text-xl">𝕏</span>
                    Share on X/Twitter
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <span className="text-xl">in</span>
                    Share on LinkedIn
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <span>💰</span> Earn Commissions
                </h4>
                <p className="text-sm text-purple-700">
                  When someone signs up through your referral link, you'll earn commission on their subscription.
                  Legacy tier members earn 15% recurring revenue!
                </p>
              </div>
            </div>
          )}

          {/* Iframe Embed Tab */}
          {activeTab === 'iframe' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Embed Options
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Width</label>
                    <input
                      type="text"
                      value={embedOptions.width}
                      onChange={(e) => setEmbedOptions({ ...embedOptions, width: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="100%"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height</label>
                    <input
                      type="text"
                      value={embedOptions.height}
                      onChange={(e) => setEmbedOptions({ ...embedOptions, height: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="600px"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Theme</label>
                    <select
                      value={embedOptions.theme}
                      onChange={(e) => setEmbedOptions({ ...embedOptions, theme: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={embedOptions.showHeader}
                        onChange={(e) => setEmbedOptions({ ...embedOptions, showHeader: e.target.checked })}
                        className="w-4 h-4 text-vault-purple rounded"
                      />
                      Show Header
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Embed Code
                  </label>
                  <button
                    onClick={copyEmbedCode}
                    className={`
                      px-4 py-1 rounded-md text-sm font-medium transition-all
                      ${copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }
                    `}
                  >
                    {copied ? '✓ Copied!' : 'Copy Code'}
                  </button>
                </div>
                <textarea
                  value={getEmbedCode()}
                  readOnly
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-xs font-mono"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>ℹ️</span> For Agency Partners
                </h4>
                <p className="text-sm text-blue-700">
                  Pro & Legacy tier members can embed scrolls on client sites with white-label options.
                  Contact support for custom branding.
                </p>
              </div>
            </div>
          )}

          {/* Preview Card Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preview Card HTML
                </label>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">
                    Perfect for newsletters, blog posts, and presentations
                  </p>
                  <button
                    onClick={copyEmbedCode}
                    className={`
                      px-4 py-1 rounded-md text-sm font-medium transition-all
                      ${copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }
                    `}
                  >
                    {copied ? '✓ Copied!' : 'Copy Code'}
                  </button>
                </div>
                <textarea
                  value={getEmbedCode()}
                  readOnly
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Live Preview
                </label>
                <div 
                  className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: getEmbedCode() }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            📊 Tracking enabled: Views and conversions are tracked
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareScrollModal
