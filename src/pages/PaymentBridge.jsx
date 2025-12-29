import React, { useState, useEffect } from 'react';
import { axios } from 'axios';

const PaymentBridge = () => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'NGN',
    requestType: 'payout',
    bankAccount: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      bankCode: ''
    },
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/v1/payment-bridge/request', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      setFormData({
        amount: '',
        currency: 'NGN',
        requestType: 'payout',
        bankAccount: {
          accountName: '',
          accountNumber: '',
          bankName: '',
          bankCode: ''
        },
        notes: ''
      });

      setRequests(prev => [...prev, response.data]);
      setLoading(false);
    } catch (err) {
      console.error('Payment request failed:', err);
      setError(err.response?.data?.message || 'Request failed');
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/v1/payment-bridge/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      setRequests(response.data.requests || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to fetch requests');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="border-b border-gray-200 p-4 rounded-t-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Payment Bridge
            </h2>
            <p className="text-gray-600 mb-4">
              Submit payment requests and track payouts through our integrated Paystack system.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (cents)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="1000"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                    placeholder="10000"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                  required
                  >
                    <option value="NGN">NGN (Nigerian Naira)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                    required
                  >
                    <option value="payout">Payout</option>
                    <option value="bridge">Bridge Payment</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account Details
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={formData.bankAccount.accountName}
                    onChange={handleInputChange}
                    placeholder="Account Holder Name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.bankAccount.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Account Number"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankAccount.bankName}
                    onChange={handleInputChange}
                    placeholder="Bank Name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    id="bankCode"
                    name="bankCode"
                    value={formData.bankAccount.bankCode}
                    onChange={handleInputChange}
                    placeholder="Bank Code (e.g., 057, 033)"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500"
                    placeholder="Add any additional information..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-500 disabled:opacity-50 transition duration-200"
                >
                  {loading ? (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-t-transparent border-blue-600"></div>
                  ) : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8">
            <div className="border-t border-gray-200">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Recent Payment Requests
                </h3>
                {requests.length === 0 ? (
                  <p className="text-gray-500">No payment requests found.</p>
                ) : (
                  <div className="space-y-2">
                    {requests.map((request, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-medium text-gray-500">#{request.id.slice(-8)}</span>
                            <span className="text-sm text-gray-900 font-medium">
                              {request.reference}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm px-2 py-1 rounded ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'paid' ? 'bg-green-100 text-green-800' :
                              request.status === 'failed' ? 'bg-red-100 text-red-800' :
                              request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(request.created_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Amount: ₦{(request.amount_cents / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Fee: ₦{(request.processing_fee_cents / 100).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import paymentBridgeRoutes from '../routes/paymentBridge';
