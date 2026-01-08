import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CLICommandGenerator from './CLICommandGenerator'

function ScrollViewer({ scroll, onBack, hasPass }) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadScrollContent = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch from public folder
        const response = await fetch(`/docs/lore/scrolls/${scroll.id}.md`)
        
        if (!response.ok) {
          throw new Error(`Failed to load scroll: ${response.statusText}`)
        }
        
        const text = await response.text()
        setContent(text)
      } catch (err) {
        console.error('Error loading scroll:', err)
        setError(err.message)
        // Fallback content
        setContent(`# ${scroll.title}\n\n*This scroll is being forged. Check back soon.*\n\n${scroll.description}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadScrollContent()
  }, [scroll])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-vault-purple font-medium mb-6 flex items-center transition-colors"
        >
          <span className="mr-2">←</span> Back to Library
        </button>
        <div className="card">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-vault-purple font-medium mb-6 flex items-center transition-colors"
      >
        <span className="mr-2">←</span> Back to Library
      </button>

      {/* Scroll Header */}
      <div className="card mb-6 bg-gradient-to-br from-vault-purple/5 to-vault-blue/5">
        <div className="flex items-start space-x-4">
          <div className="text-6xl">{scroll.icon}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{scroll.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{scroll.subtitle}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>📖 {scroll.readTime} read</span>
              <span>•</span>
              <span className="capitalize">{scroll.category}</span>
              <span>•</span>
              <span className="capitalize">{scroll.tier} tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* CLI Command Generator - Show for scrolls with CLI commands */}
      {['audit-as-a-service', 'dream-mover-cli', 'AGENCY_CLI_QUICKSTART', '10-agency-scroll', 'creator-pass'].includes(scroll.id) && (
        <CLICommandGenerator scrollId={scroll.id} />
      )}

      {/* Scroll Content */}
      <div className="card prose prose-lg max-w-none">
        {error ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Scroll Not Found</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={onBack} className="btn-primary">
              Return to Library
            </button>
          </div>
        ) : (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom rendering for code blocks
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <div className="relative">
                    <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {match[1]}
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className="bg-gray-100 text-vault-purple px-2 py-1 rounded text-sm" {...props}>
                    {children}
                  </code>
                )
              },
              // Custom link rendering
              a({node, children, href, ...props}) {
                const isInternal = href && (href.startsWith('/') || href.startsWith('#'))
                return (
                  <a
                    href={href}
                    className="text-vault-purple hover:text-vault-blue font-medium underline"
                    target={isInternal ? '_self' : '_blank'}
                    rel={isInternal ? '' : 'noopener noreferrer'}
                    {...props}
                  >
                    {children}
                  </a>
                )
              },
              // Custom table rendering
              table({node, children, ...props}) {
                return (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full divide-y divide-gray-200 border" {...props}>
                      {children}
                    </table>
                  </div>
                )
              },
              // Blockquote styling
              blockquote({node, children, ...props}) {
                return (
                  <blockquote className="border-l-4 border-vault-purple pl-4 italic text-gray-700 my-6" {...props}>
                    {children}
                  </blockquote>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-8 card bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Found this scroll valuable?</h3>
            <p className="text-gray-600 text-sm">Share it with your fellow builders.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Scroll link copied to clipboard!')
              }}
              className="btn-outline text-sm"
            >
              📋 Copy Link
            </button>
            <button 
              onClick={() => {
                window.print()
              }}
              className="btn-outline text-sm"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      {/* Related Scrolls - Coming Soon */}
      <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500 text-sm">
          📚 Related scrolls and navigation coming soon...
        </p>
      </div>
    </div>
  )
}

export default ScrollViewer
