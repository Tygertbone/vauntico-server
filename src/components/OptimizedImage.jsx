import { useState } from 'react'

/**
 * Optimized Image Component
 * 
 * Features:
 * - Lazy loading
 * - Blur-up placeholder
 * - WebP with fallback
 * - Proper sizing to prevent CLS
 */
function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  priority = false,
  objectFit = 'cover'
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Generate WebP source if available
  const webpSrc = src?.endsWith('.png') || src?.endsWith('.jpg') 
    ? src.replace(/\.(png|jpg)$/, '.webp') 
    : src

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <div
      className={`relative overflow-hidden ${className} ${width ? 'optimized-image-fixed-width' : 'optimized-image-full-width'} ${height ? 'optimized-image-fixed-height' : 'optimized-image-auto-height'} ${width && height ? 'optimized-image-has-aspect-ratio' : ''}`}
      data-width={width}
      data-height={height}
      data-aspect-ratio={width && height ? `${width}/${height}` : undefined}
    >
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      <picture>
        {/* WebP version for modern browsers */}
        {webpSrc !== src && (
          <source srcSet={webpSrc} type="image/webp" />
        )}
        
        {/* Fallback */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full transition-opacity duration-300
            optimized-image-object-fit-${objectFit}
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${objectFit === 'cover' ? 'object-cover' : ''}
            ${objectFit === 'contain' ? 'object-contain' : ''}
          `}
        />
      </picture>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OptimizedImage
