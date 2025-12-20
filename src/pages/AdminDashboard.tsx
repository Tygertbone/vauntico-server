import { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import { ProofCard } from "../components/ProofCard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

interface Proof {
  id: string;
  userId: string;
  planCode: string;
  currency: string;
  amount: number;
  createdAt: string;
}

interface FxRate {
  currency: string;
  rate: number;
  lastUpdated: string;
}

interface Analytics {
  mrr: number;
  churn: number;
  trialConversion: number;
}

export default function AdminDashboard() {
  const [fxRates, setFxRates] = useState<FxRate | null>(null);
  const [allProofs, setAllProofs] = useState<Proof[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockUserId, setUnlockUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [unlockStatus, setUnlockStatus] = useState('');

  const adminKey = process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY || 'default-admin-key';

  useEffect(() => {
    if (!adminKey) {
      console.error('Admin access key not configured');
      setLoading(false);
      return;
    }

    const headers = { "x-admin-key": adminKey };

    Promise.all([
      axios.get("/api/admin/fx-cache/USD", { headers }).catch(err => {
        console.warn('FX cache not available:', err.message);
        return { data: null };
      }),
      axios.get("/api/admin/proofs/all", { headers }).catch(err => {
        console.error('Failed to fetch proofs:', err.message);
        return { data: [] };
      }),
      axios.get("/api/admin/analytics", { headers }).catch(err => {
        console.warn('Analytics not available:', err.message);
        return { data: null };
      }),
    ]).then(([fxRes, proofsRes, analyticsRes]) => {
      setFxRates(fxRes.data);
      setAllProofs(proofsRes.data);
      setAnalytics(analyticsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Dashboard load error:', err);
      setLoading(false);
    });
  }, [adminKey]);

  const handleSendUnlockCode = async () => {
    if (!unlockUserId) {
      setUnlockStatus('Please enter a user ID');
      return;
    }

    try {
      const response = await axios.post('/api/admin/mfa/send-unlock-code', {
        userId: unlockUserId
      }, {
        headers: { "x-admin-key": adminKey }
      });

      setUnlockStatus('MFA code sent! Check the user\'s email.');
    } catch (error: any) {
      setUnlockStatus(error.response?.data?.error || 'Failed to send code');
    }
  };

  const handleUnlockAccount = async () => {
    if (!unlockUserId || !mfaCode) {
      setUnlockStatus('Please enter both user ID and MFA code');
      return;
    }

    try {
      const response = await axios.post('/api/admin/mfa/unlock-account', {
        userId: unlockUserId,
        code: mfaCode
      }, {
        headers: { "x-admin-key": adminKey }
      });

      setUnlockStatus('Account unlocked successfully!');
      setUnlockUserId('');
      setMfaCode('');
    } catch (error: any) {
      setUnlockStatus(error.response?.data?.error || 'Failed to unlock account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/50 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/70 rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-32 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">Admin access key not configured in environment variables.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor subscriptions, FX rates, and system analytics</p>
        </div>

        {/* MFA Account Unlock Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Account Unlock (MFA Required)</h2>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
              Secure Process
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={unlockUserId}
                onChange={(e) => setUnlockUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MFA Code
              </label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSendUnlockCode}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Send Unlock Code
            </button>
            <button
              onClick={handleUnlockAccount}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Unlock Account
            </button>
          </div>

          {unlockStatus && (
            <div className={`mt-3 p-3 rounded-md ${unlockStatus.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {unlockStatus}
            </div>
          )}
        </div>

        {/* FX Cache Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">FX Cache</h2>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Live Rates
            </div>
          </div>
          {fxRates ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['ZAR', 'NGN', 'EUR'].map(currency => (
                <div key={currency} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 uppercase">{currency}</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {fxRates.currency === currency ? fxRates.rate.toFixed(4) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    1 USD = {currency}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              FX cache not available. Rates will load when first requested.
            </div>
          )}
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Recurring Revenue</h3>
              <div className="h-48">
                <Bar
                  data={{
                    labels: ['MRR'],
                    datasets: [{
                      label: 'USD',
                      data: [analytics.mrr],
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1,
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { display: false }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Rate</h3>
              <div className="h-48">
                <Line
                  data={{
                    labels: ['Current'],
                    datasets: [{
                      label: '%',
                      data: [analytics.churn],
                      borderColor: 'rgba(239, 68, 68, 1)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      pointRadius: 6,
                      pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { display: false }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trial Conversion</h3>
              <div className="h-48">
                <Bar
                  data={{
                    labels: ['Conversion'],
                    datasets: [{
                      label: '%',
                      data: [analytics.trialConversion],
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                      borderColor: 'rgba(16, 185, 129, 1)',
                      borderWidth: 1,
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { display: false }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Proofs Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Subscription Proofs</h2>
            <div className="text-sm text-gray-500">
              {allProofs.length} total proof{allProofs.length !== 1 ? 's' : ''}
            </div>
          </div>

          {allProofs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📄</div>
              <p>No subscription proofs found yet.</p>
              <p className="text-sm mt-1">Proofs will appear here when users complete subscriptions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProofs.map(proof => (
                <ProofCard key={proof.id} proof={proof} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
