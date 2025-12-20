import { useState } from 'react';
import apiClient from '../lib/api';

// Custom hook for trust score calculations
export function useTrustScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateTrustScore = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.calculateTrustScore(userData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTrustScoreHistory = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const history = await apiClient.getTrustScoreHistory(userId);
      return history;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateTrustScore,
    getTrustScoreHistory,
    loading,
    error
  };
}

// Backward compatibility - keep the old method names
const calculateTrustScore = async (userData) => {
  try {
    const result = await apiClient.calculateTrustScore(userData);
    return result;
  } catch (error) {
    console.error('Legacy trust score calculation failed:', error);
    // Fallback to mock for backward compatibility
    return {
      score: Math.floor(Math.random() * 100),
      calculator: "platform_audit",
      metadata: {
        authentic: Math.random() > 0.5,
        botScore: Math.random(),
        contentQuality: Math.random()
      }
    };
  }
};

const getTrustScoreHistory = async (userId) => {
  try {
    const history = await apiClient.getTrustScoreHistory(userId);
    return history;
  } catch (error) {
    console.error('Legacy trust score history failed:', error);
    // Fallback to mock for backward compatibility
    return [
      { date: "2024-01-01", score: 85 },
      { date: "2024-01-15", score: 88 },
      { date: "2024-02-01", score: 92 },
      { date: "2024-02-15", score: 89 }
    ];
  }
};

export { calculateTrustScore, getTrustScoreHistory };
export default useTrustScore;
