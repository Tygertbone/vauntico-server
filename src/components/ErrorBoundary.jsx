import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
    
    // Send to error tracking service (Sentry, etc)
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo })
    }
    
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
          <div className="text-center max-w-2xl">
            {/* Error Visual */}
            <div className="mb-8">
              <div className="text-8xl mb-4">⚠️</div>
              <h1 className="text-4xl font-bold mb-4">
                Something Went Wrong
              </h1>
            </div>
            
            {/* Message */}
            <div className="card mb-8">
              <p className="text-lg text-gray-600 mb-4">
                The vault encountered an unexpected error. Don't worry—your data is safe.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left mt-4">
                  <summary className="cursor-pointer font-semibold text-red-600 mb-2">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="bg-red-50 p-4 rounded-lg text-xs overflow-auto text-red-800">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary text-lg px-8 py-3"
              >
                Reload Page
              </button>
              <Link to="/" className="btn-outline text-lg px-8 py-3">
                Go Home
              </Link>
            </div>
            
            {/* Support */}
            <p className="text-sm text-gray-500 mt-8">
              If this keeps happening, contact{' '}
              <a href="mailto:support@vauntico.com" className="text-vault-purple underline">
                support@vauntico.com
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
