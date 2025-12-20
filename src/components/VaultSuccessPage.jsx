import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Bookmark, ExternalLink } from 'lucide-react'
import vaunticoBanner from '../assets/vauntico_banner.webp'

const VaultSuccessPage = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => setIsLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const notionEmbedUrl = import.meta.env.VITE_NOTION_EMBED_URL || "https://classy-uranium-c6b.notion.site/Vauntico-Prompt-Vault-Founders-Edition-26a81beec93980c88b4ec6eefe61082c?source=copy_link"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Success Header */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src={vaunticoBanner} 
              alt="Vauntico Logo" 
              className="h-16 mx-auto mb-6"
            />
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Your Transformation Begins Now ✨
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            You've unlocked the vault of infinite possibilities. Welcome to the inner circle of visionaries who dare to dream bigger.
          </p>
          
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3 text-yellow-800">
                <Bookmark className="w-6 h-6" />
                <p className="text-lg font-semibold">
                  Sacred Knowledge: Bookmark this page for lifetime access to your vault and future updates!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Embedded Notion Content */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              {!isLoaded && (
                <div className="flex items-center justify-center h-96 bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--vauntico-gold)] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your vault...</p>
                  </div>
                </div>
              )}
              
              <iframe
                src={notionEmbedUrl}
                className={`w-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ 
                  height: '800px',
                  border: 'none',
                  borderRadius: '0 0 8px 8px'
                }}
                title="Vauntico Prompt Vault Content"
                onLoad={() => setIsLoaded(true)}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </CardContent>
          </Card>
          
          {/* Fallback Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Having trouble viewing the content above?
            </p>
            <a 
              href={notionEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-[var(--vauntico-gold)] hover:text-[var(--vauntico-gold-hover)] font-semibold transition-colors"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer Message */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Your Journey to Mastery Begins
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Dive deep into your prompts and witness the alchemy of transformation. We'll continue adding sacred knowledge and updates to your vault.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button 
              onClick={() => window.location.href = '/vaults'}
              className="vauntico-btn"
              aria-label="Explore more vaults"
            >
              Explore More Vaults
            </Button>
            <Button 
              onClick={() => window.location.href = '/creator-pass'}
              variant="outline"
              className="border-[var(--vauntico-gold)] text-[var(--vauntico-gold)] hover:bg-[var(--vauntico-gold)] hover:text-white"
              aria-label="Join Creator Pass"
            >
              Join Creator Pass
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Questions? Reach out to our support team anytime.
          </p>
        </div>
      </section>
    </div>
  )
}

export default VaultSuccessPage