import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Visual */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gradient mb-4">404</div>
          <div className="text-6xl mb-6">🗺️</div>
        </div>
        
        {/* Message */}
        <h1 className="text-4xl font-bold mb-4">
          You've Wandered Off the Map
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          This scroll doesn't exist... yet. Perhaps it's still being forged in the vault?
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/" className="btn-primary text-lg px-8 py-3">
            Return Home
          </Link>
          <Link to="/lore" className="btn-outline text-lg px-8 py-3">
            Browse Scrolls
          </Link>
        </div>
        
        {/* Popular Pages */}
        <div className="card max-w-lg mx-auto">
          <h2 className="font-semibold text-lg mb-4">Popular Destinations</h2>
          <div className="space-y-2 text-left">
            <Link to="/creator-pass" className="block text-vault-purple hover:underline">
              → Creator Pass Tiers
            </Link>
            <Link to="/vaults" className="block text-vault-purple hover:underline">
              → Intelligent Vaults
            </Link>
            <Link to="/pricing" className="block text-vault-purple hover:underline">
              → Pricing & Plans
            </Link>
            <Link to="/about" className="block text-vault-purple hover:underline">
              → About Vauntico
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
