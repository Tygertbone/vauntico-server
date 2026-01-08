import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Verification = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationForm, setVerificationForm] = useState({
    platform: '',
    platformUsername: ''
  });

  // Fetch user's verifications on component mount
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (token) {
        const response = await axios.get('/api/v1/verify/directory', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setVerifications(response.data.verifications || []);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
      setError('Failed to fetch verification status');
      setLoading(false);
    }
  };

  const handleSubmitVerification = async (platform, platformUsername) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        const response = await axios.post('/api/v1/verify/submit', {
          platform,
          platformUsername,
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Reset form and refresh verifications
        if (response.data.verification) {
          setVerifications(prev => [...prev, response.data.verification]);
          setVerificationForm({ platform: '', platformUsername: '' });
        }

        setLoading(false);
        alert('Verification submitted successfully!');
      }
    } catch (err) {
      console.error('Failed to submit verification:', err);
      setError('Failed to submit verification request');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="border-b border-gray-200 p-4 rounded-t-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Platform Verification
            </h1>
            <p className="text-gray-600 mb-4">
              Submit verification requests for your social media platforms to earn trust score bonuses.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-blue-500"
                  onChange={(e) => setVerificationForm({...verificationForm, platform: e.target.value})}
                  value={verificationForm.platform}
                >
                  <option value="">Select platform...</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Username
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-blue-500"
                  placeholder="@username"
                  onChange={(e) => setVerificationForm({...verificationForm, platformUsername: e.target.value})}
                  value={verificationForm.platformUsername}
                />
              </div>

              <button
                type="button"
                className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-500 transition-colors"
                onClick={() => handleSubmitVerification(verificationForm.platform, verificationForm.platformUsername)}
                disabled={loading || !verificationForm.platform || !verificationForm.platformUsername}
              >
                {loading ? 'Submitting verification...' : `Submit ${verificationForm.platform ? verificationForm.platform.charAt(0).toUpperCase() + verificationForm.platform.slice(1) : 'Platform'} Verification`}
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Verification Status</h3>
            <div className="space-y-4">
              {verifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-t-transparent border-blue-600"></div>
                  <p className="text-gray-500 mt-4">Fetching verification status...</p>
                </div>
              ) : (
                verifications.map((verification, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {verification.platform.toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          @{verification.platform_username}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm px-3 py-1 rounded ${
                          verification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          verification.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          verification.status === 'verified' ? 'bg-green-100 text-green-800' :
                          verification.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {verification.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Submitted: {new Date(verification.created_at).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Expires: {verification.expires_at ? new Date(verification.expires_at).toLocaleString() : 'Never'}
                    </div>
                    {verification.trust_score_impact && (
                      <div className="text-sm text-gray-600 mt-1">
                        Trust Score Impact: +{verification.trust_score_impact}
                      </div>
                    )}
                    {verification.status === 'verified' && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-center">
                          <svg className="w-6 h-6 text-green-600 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="mt-2 text-sm font-medium text-green-800">Verified!</p>
                          <p className="text-xs text-green-600">Your account has been verified</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
