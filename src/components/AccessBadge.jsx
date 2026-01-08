function AccessBadge({ hasAccess, reason }) {
  if (!hasAccess) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h3m-3 10v6a3 3 0 013-6 0 013-6h3a3 3 0 013-6 0 013-6 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-1">Access Required</h3>
            <p className="text-yellow-700">You need a Creator Pass to access this feature.</p>
            <p className="text-sm text-yellow-600 mt-2">Reason: {reason}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-2-4-2m6 2a9 9 0 013-6 0 013-6 0 013-6 0 013-6 4-2m0 6a9 9 0 013-6 0 013-6 0 013-6 3z" />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-green-800 mb-1">Access Granted</h3>
          <p className="text-green-700">You have full access to this feature.</p>
        </div>
      </div>
    </div>
  )
}

export default AccessBadge
