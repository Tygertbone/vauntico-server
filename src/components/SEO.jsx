import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * SEO Component - Manage meta tags dynamically
 * 
 * Usage:
 * <SEO 
 *   title="Page Title"
 *   description="Page description"
 *   canonical="/page-path"
 *   image="/og-image.jpg"
 * />
 */
function SEO({ 
  title = 'Vauntico | The Creator OS That Actually Ships',
  description = 'Ship 10x faster with the CLI that thinks like you. One command generates complete landing pages, workshops, and audits.',
  canonical,
  image = '/vauntico_banner.webp',
  type = 'website',
  noindex = false
}) {
  const location = useLocation()
  const siteUrl = 'https://vauntico.com'
  const fullUrl = `${siteUrl}${canonical || location.pathname}`
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`

  useEffect(() => {
    // Update document title
    document.title = title

    // Update meta description
    updateMetaTag('name', 'description', description)

    // Update canonical URL
    updateLinkTag('canonical', fullUrl)

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title)
    updateMetaTag('property', 'og:description', description)
    updateMetaTag('property', 'og:url', fullUrl)
    updateMetaTag('property', 'og:image', fullImage)
    updateMetaTag('property', 'og:type', type)

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', title)
    updateMetaTag('name', 'twitter:description', description)
    updateMetaTag('name', 'twitter:image', fullImage)

    // Update robots tag
    if (noindex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow')
    } else {
      updateMetaTag('name', 'robots', 'index, follow')
    }
  }, [title, description, fullUrl, fullImage, type, noindex])

  return null
}

// Helper: Update or create meta tag
function updateMetaTag(attribute, key, content) {
  if (!content) return

  let element = document.querySelector(`meta[${attribute}="${key}"]`)
  
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  
  element.setAttribute('content', content)
}

// Helper: Update or create link tag
function updateLinkTag(rel, href) {
  if (!href) return

  let element = document.querySelector(`link[rel="${rel}"]`)
  
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  
  element.setAttribute('href', href)
}

export default SEO
