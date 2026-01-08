import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FullLogo } from '../components/Logo'
import { Heart, Eye } from 'lucide-react'

const LoreVault = () => {
  const [posts, setPosts] = useState([])

  const lorePosts = [
    {
      id: 1,
      title: "The First Trust Score",
      author: "Anonymous Founder",
      date: "January 2024",
      content: "I never thought trust could be quantified. Our first user hit 87.2% and the whole system illuminated with understanding. This wasn't just data—this was knowledge being born.",
      category: "revelation",
      likes: 142,
      comments: 12,
      isFounder: true
    },
    {
      id: 2,
      title: "The Covenant Protocol",
      author: "System Architect",
      date: "February 2024",
      content: "We discovered the fundamental principle: Trust is reciprocal. Every creator who contributes to the ecosystem strengthens the collective. This became our first core commandment.",
      category: "protocol",
      likes: 98,
      comments: 24,
      isFounder: false
    },
    {
      id: 3,
      title: "Vault Guardians Awaken",
      author: "Security Lead",
      date: "March 2024",
      content: "The first vault guardians completed their initiation. Our defense systems detected unusual activity patterns—preemptive threat neutralization. When we work together, our security becomes exponentially stronger.",
      category: "security",
      likes: 76,
      comments: 8,
      isFounder: false
    },
    {
      id: 4,
      title: "The Great Synchronization",
      author: "Data Architect",
      date: "April 2024",
      content: "All systems synchronized perfectly. The moment when creator, platform, and vault became one unified entity. Our data flows achieved perfect harmony.",
      category: "milestone",
      likes: 189,
      comments: 31,
      isFounder: false
    }
  ]

  const categories = [
    { id: 'revelation', name: 'Revelations', color: 'purple' },
    { id: 'protocol', name: 'Protocols', color: 'blue' },
    { id: 'security', name: 'Security', color: 'red' },
    { id: 'milestone', name: 'Milestones', color: 'yellow' }
  ]

  const filteredPosts = posts.filter(post => 
    categories.find(cat => cat.id === 'revelation') || post.category === 'revelation'
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
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
              <Link to="/lore" className="text-white font-medium">Lore Vault</Link>
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-gradient">Lore Vault</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The sacred texts and wisdom of Vauntico, preserved for future generations.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setPosts(category.id === 'revelation' ? lorePosts : posts)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filteredPosts[0]?.category === 'revelation' && category.id === 'revelation' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredPosts.map(post => (
            <div 
              key={post.id}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-${categories.find(cat => cat.id === post.category)?.color || 'gray'}-600 text-white`}>
                  {post.isFounder && <span className="mr-2">👑</span>}
                  {post.title}
                </div>
                <div className="text-gray-500 text-sm">
                  By {post.author} • {post.date}
                </div>
              </div>
              <div className="text-gray-300">
                <div className="mb-4">
                  <p className="text-white leading-relaxed">{post.content}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="ml-1">{post.likes}</span>
                    <Eye className="w-4 h-4 text-gray-400 ml-2" />
                    <span className="ml-1">{post.comments}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 max-w-2xl mx-auto border border-white/10">
              <div className="text-center mb-4">
                <span className="text-6xl">📜</span>
                <h3 className="text-xl font-bold mb-2">No Lore Posts Yet</h3>
                <p className="text-gray-300">
                  The wisdom of Vauntico grows with every contribution. 
                  Be the first to share your knowledge and experiences.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoreVault
