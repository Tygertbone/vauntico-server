function LoadingSpinner({ size = 'md', color = 'white' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const colorClasses = {
    white: 'border-white border-t-transparent',
    purple: 'border-vault-purple border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  }
  
  return (
    <div 
      className={`inline-block ${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
