import React, { useState } from 'react';
import { Mail, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const WaitlistSystem = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setPosition(data.position);
        setEmail('');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're on the list!</h3>
        <p className="text-gray-600 mb-4">
          Welcome to the Vauntico beta program. Your queue position is:
        </p>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full text-white text-2xl font-bold mb-4">
          #{position}
        </div>
        <p className="text-sm text-gray-500 mb-2">Queue Position</p>
        <p className="text-gray-600 text-sm">
          We'll send you an invitation as soon as a spot opens up. Keep an eye on your inbox!
        </p>
        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-2" />
          Invites sent weekly on Mondays
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Join the Waitlist</h3>
          <p className="text-gray-600 text-sm">Be first to access Vauntico beta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">
          <strong>2,847</strong> creators are already waiting
        </p>
        <p className="text-xs text-gray-400">
          Limited spots available. Join now to secure your place.
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
            Early access
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
            Beta features
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
            Priority support
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistSystem;
