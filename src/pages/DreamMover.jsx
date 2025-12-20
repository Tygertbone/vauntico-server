import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const DreamMover = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [analysisResults, setAnalysisResults] = useState(null)

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result
        setVideoUrl(dataUrl)
        
        // Simulate AI analysis
        setTimeout(() => {
          const analysis = {
            videoQuality: Math.floor(Math.random() * 100),
            engagement: Math.floor(Math.random() * 100),
            performance: Math.floor(Math.random() * 100),
            optimization: Math.floor(Math.random() * 100),
            score: Math.floor(Math.random() * 100)
          }
          setAnalysisResults(analysis)
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

  const runAIAnalysis = () => {
    console.log('🧠 AI Analysis started')
    // Simulate analysis
    setTimeout(() => {
      const analysis = {
        videoQuality: Math.floor(Math.random() * 100),
        engagement: Math.floor(Math.random() * 100),
        performance: Math.floor(Math.random() * 100),
        optimization: Math.floor(Math.random() * 100),
        score: Math.floor(Math.random() * 100)
      }
      setAnalysisResults(analysis)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold">🎯</div>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/vaults" className="text-white font-medium">Vaults</Link>
              <Link to="/workshop-kit" className="text-white font-medium">Dream Mover</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Dream Mover <span className="text-gradient">Service</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload your video and get AI-powered analysis of your content performance
          </p>
        </div>

        {/* Video Upload Section */}
        <div className="max-w-3xl mx-auto mb-12">
          {videoUrl ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="text-center mb-6">
                <div className="text-5xl">🎬</div>
                <div className="text-xl font-semibold mb-4">Video Uploaded Successfully!</div>
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full h-64 rounded-lg" 
                  autoPlay 
                  loop 
                  muted
                />
              </div>
              <button 
                onClick={runAIAnalysis}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Run AI Analysis
              </button>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
              <div className="mb-6">
                <label className="block text-left text-gray-300 mb-2">
                  Upload Video File
                </label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoUpload}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Analysis Results */}
        {analysisResults ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">🤖 AI Analysis Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="text-lg font-semibold text-gray-300 mb-2">Video Quality</div>
                <div className="text-3xl font-bold text-purple-600 mb-4">{analysisResults.videoQuality}%</div>
              </div>
              
              <div>
                <div className="text-lg font-semibold text-gray-300 mb-2">Engagement Rate</div>
                <div className="text-3xl font-bold text-purple-600 mb-4">{analysisResults.engagement}%</div>
              </div>
              
              <div>
                <div className="text-lg font-semibold text-gray-300 mb-2">Performance Score</div>
                <div className="text-3xl font-bold text-purple-600 mb-4">{analysisResults.performance}%</div>
              </div>
              
              <div>
                <div className="text-lg font-semibold text-gray-300 mb-2">Overall Score</div>
                <div className="text-3xl font-bold text-purple-600 mb-4">{analysisResults.score}%</div>
              </div>
            </div>
            
            <button 
              onClick={() => setAnalysisResults(null)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg mt-6"
            >
              Clear Results
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default DreamMover
