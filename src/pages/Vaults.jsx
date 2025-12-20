import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FullLogo } from '../components/Logo'
import { 
  Lock, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp, 
  Eye,
  Plus,
  Key,
  Crown,
  Star,
  Search,
  Filter,
  ArrowRight,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react'

const Vaults = () => {
  const [selectedVault, setSelectedVault] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const vaults = [
    {
      id: 1,
      name: 'Creator Portfolio Vault',
      description: 'Showcase your best content in a secure, customizable vault',
      type: 'portfolio',
      items: 12,
      access: 'premium',
      encryption: 'military-grade',
      lastModified: '2 hours ago'
    },
    {
      id: 2,
      name: 'NFT Collection Vault',
      description: 'Store and manage your digital collectibles with blockchain security',
      type: 'nft',
      items: 8,
      access: 'pro',
      encryption: 'blockchain',
      lastModified: '1 day ago'
    },
    {
      id: 3,
      name: 'Private Content Archive',
      description: 'Secure private documents and media with granular access controls',
      type: 'archive',
      items: 25,
      access: 'creator-pass',
      encryption: 'zero-knowledge',
      lastModified: '3 days ago'
    },
    {
      id: 4,
      name: 'Collaboration Vault',
      description: 'Shared workspace for team projects and co-creation',
      type: 'collaboration',
      items: 15,
      access: 'team',
      encryption: 'end-to-end',
      lastModified: '5 hours ago'
    }
  ]

  const filteredVaults = vaults.filter(vault => {
    if (filterType === 'all') return true
    return vault.type === filterType
  })

  const filteredAndSearched = filteredVaults.filter(vault => 
    vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vault.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getAccessLevel = (access) => {
    const levels = {
      'premium': { color: 'text-yellow-400', label: 'Premium' },
      'pro': { color: 'text-purple-400', label: 'Pro' },
      'creator-pass': { color: 'text-blue-400', label: 'Creator Pass' },
      'team': { color: 'text-green-400', label: 'Team' }
    }
    return levels[access] || levels.premium
  }

  const getEncryptionIcon = (encryption) => {
    const icons = {
      'military-grade': <Shield className="w-4 h-4" />,
      'blockchain': <Lock className="w-4 h-4" />,
      'zero-knowledge': <Eye className="w-4 h-4" />,
      'end-to-end': <Users className="w-4 h-4" />
    }
    return icons[encryption] || <Shield className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <FullLogo size="md" />
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/vaults" className="text-white font-medium">Vaults</Link>
              <Link to="/creator-pass" className="text-gray-300 hover:text-white transition-colors">Creator Pass</Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Your <span className="text-gradient">Vaults</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Secure your valuable content with AI-powered vaults and blockchain security
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vaults..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('portfolio')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'portfolio' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setFilterType('nft')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'nft' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              NFTs
            </button>
          </div>
        </div>

        {/* Vault Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSearched.map((vault) => (
            <div
              key={vault.id}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              onClick={() => setSelectedVault(vault)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getEncryptionIcon(vault.encryption)}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{vault.name}</h3>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getAccessLevel(vault.access).color}`}>
                        {getAccessLevel(vault.access).label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{vault.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>{vault.items} items</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>{vault.encryption} encryption</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Modified {vault.lastModified}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getAccessLevel(vault.access)}
                  <span>Access Level</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600">
                <button className="w-full btn-primary py-3">
                  Open Vault
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 space-y-6">
              <Lock className="w-16 h-16 text-white mx-auto animate-pulse-glow" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Secure Your Digital Legacy
              </h2>
              <p className="text-xl text-white/90">
                Create and protect your most valuable content with military-grade security
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/creator-pass" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
                  Upgrade to Creator Pass
                </Link>
                <Link to="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg">
                  Compare Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Vaults
