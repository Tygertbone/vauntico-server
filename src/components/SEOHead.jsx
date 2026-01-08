import { useEffect } from 'react'

/**
 * SEOHead Component
 * 
 * Dynamically updates document meta tags for SEO optimization.
 * Handles title, description, Open Graph tags, Twitter cards, and canonical URLs.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Page title (will append " | Vauntico")
 * @param {string} props.description - Meta description (150-160 characters recommended)
 * @param {string} [props.ogImage] - Open Graph image URL (default: Vauntico logo)
 * @param {string} [props.canonicalUrl] - Canonical URL for this page
 * @param {string} [props.type='website'] - Open Graph type (website, article, etc.)
 * @param {Array} [props.keywords] - SEO keywords (optional, modern SEO uses minimal keywords)
 * 
 * @example
 * <SEOHead
 *   title="Vauntico vs Jasper 2025"
 *   description="Compare Vauntico and Jasper. See why CLI beats templates."
 *   canonicalUrl="https://vauntico.com/vs/jasper"
 *   ogImage="https://vauntico.com/og-jasper.png"
 * />
 */
function SEOHead({
  title,
  description,
  ogImage = 'https://vauntico.com/og-default.png', // Default OG image
  canonicalUrl,
  type = 'website',
  keywords = []
}) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title.includes('Vauntico') ? title : `${title} | Vauntico`
    }

    // Update or create meta description
    updateMetaTag('name', 'description', description)

    // Update or create keywords (optional, less important for modern SEO)
    if (keywords && keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '))
    }

    // Open Graph tags
    updateMetaTag('property', 'og:title', title)
    updateMetaTag('property', 'og:description', description)
    updateMetaTag('property', 'og:image', ogImage)
    updateMetaTag('property', 'og:type', type)
    if (canonicalUrl) {
      updateMetaTag('property', 'og:url', canonicalUrl)
    }

    // Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', title)
    updateMetaTag('name', 'twitter:description', description)
    updateMetaTag('name', 'twitter:image', ogImage)

    // Canonical URL
    if (canonicalUrl) {
      updateCanonicalLink(canonicalUrl)
    }

    // Cleanup function (optional - resets to default on unmount)
    return () => {
      // You can choose to reset meta tags here if needed
      // For SPAs, it's often better to leave them as-is until next page loads
    }
  }, [title, description, ogImage, canonicalUrl, type, keywords])

  // Helper function to update or create meta tags
  const updateMetaTag = (attribute, attributeValue, content) => {
    if (!content) return

    let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`)
    
    if (element) {
      // Update existing tag
      element.setAttribute('content', content)
    } else {
      // Create new tag
      element = document.createElement('meta')
      element.setAttribute(attribute, attributeValue)
      element.setAttribute('content', content)
      document.head.appendChild(element)
    }
  }

  // Helper function to update canonical link
  const updateCanonicalLink = (url) => {
    let link = document.querySelector('link[rel="canonical"]')
    
    if (link) {
      link.setAttribute('href', url)
    } else {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      link.setAttribute('href', url)
      document.head.appendChild(link)
    }
  }

  // This component doesn't render anything visible
  return null
}

export default SEOHead

/**
 * USAGE EXAMPLES:
 * 
 * Basic usage:
 * <SEOHead
 *   title="Vauntico vs Jasper"
 *   description="Compare Vauntico and Jasper AI tools"
 * />
 * 
 * Full usage with all options:
 * <SEOHead
 *   title="Vauntico vs Jasper 2025: CLI Beats Templates"
 *   description="Discover why Vauntico's CLI workflow beats Jasper's templates. Save $471/mo and ship 10x faster with AI that learns your voice."
 *   canonicalUrl="https://vauntico.com/vs/jasper"
 *   ogImage="https://vauntico.com/images/og-jasper-comparison.png"
 *   type="article"
 *   keywords={['vauntico', 'jasper', 'ai writing', 'content creation']}
 * />
 * 
 * Integration in comparison pages:
 * 
 * function VsJasper() {
 *   return (
 *     <>
 *       <SEOHead
 *         title="Vauntico vs Jasper 2025"
 *         description="Compare Vauntico and Jasper..."
 *         canonicalUrl={`https://vauntico.com${window.location.pathname}`}
 *       />
 *       <div>Page content...</div>
 *     </>
 *   )
 * }
 */
