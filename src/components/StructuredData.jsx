import { useEffect } from 'react'

/**
 * StructuredData Component - Inject JSON-LD schema
 * 
 * Usage:
 * <StructuredData type="Product" data={{ name: "...", price: "..." }} />
 */
function StructuredData({ type, data }) {
  useEffect(() => {
    const schema = generateSchema(type, data)
    if (!schema) return

    const scriptId = `structured-data-${type.toLowerCase()}`
    
    // Remove existing script if present
    const existingScript = document.getElementById(scriptId)
    if (existingScript) {
      existingScript.remove()
    }

    // Add new script
    const script = document.createElement('script')
    script.id = scriptId
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [type, data])

  return null
}

// Schema generators
function generateSchema(type, data) {
  const generators = {
    Organization: generateOrganizationSchema,
    Product: generateProductSchema,
    SoftwareApplication: generateSoftwareSchema,
    FAQPage: generateFAQSchema,
    BreadcrumbList: generateBreadcrumbSchema
  }

  const generator = generators[type]
  return generator ? generator(data) : null
}

function generateOrganizationSchema(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vauntico',
    url: 'https://vauntico.com',
    logo: 'https://vauntico.com/logo.png',
    description: 'AI-powered Creator OS that helps creators ship 10x faster',
    sameAs: [
      // Add social media links here
    ],
    ...data
  }
}

function generateProductSchema(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name || 'Vauntico Creator Pass',
    description: data.description || 'CLI-first content creation platform',
    brand: {
      '@type': 'Brand',
      name: 'Vauntico'
    },
    offers: data.offers || [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '16',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '55',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Legacy',
        price: '165',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    ],
    aggregateRating: data.rating || {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      reviewCount: '2500'
    }
  }
}

function generateSoftwareSchema(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Vauntico CLI',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Windows, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2500'
    },
    ...data
  }
}

function generateFAQSchema(data) {
  if (!data.questions || !Array.isArray(data.questions)) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  }
}

function generateBreadcrumbSchema(data) {
  if (!data.items || !Array.isArray(data.items)) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

export default StructuredData
