// src/lib/aiClient.js – Vauntico AI Client for Claude Integration

// Environment configuration with fallbacks
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ||
                     (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

/**
 * Ask Claude AI a question via Vauntico backend
 * @param {string} prompt - The prompt to send to Claude (required, non-empty)
 * @param {number} maxTokens - Maximum tokens (optional, defaults to 700, enforced to ≤ 1000)
 * @returns {Promise<string>} Claude's response text
 * @throws {Error} If prompt is invalid or API call fails
 */
export async function askClaude(prompt, maxTokens = 700) {
  // Input validation
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Valid non-empty prompt required for AI request');
  }

  // Cost control enforcement (frontend layer)
  const enforcedMaxTokens = Math.min(maxTokens && Number(maxTokens) || 700, 1000);

  // Prepare API request
  const requestPayload = {
    prompt: prompt.trim(),
    maxTokens: enforcedMaxTokens
  };

  console.log(`🚀 Vauntico AI: Sending ${prompt.length} char prompt, maxTokens=${enforcedMaxTokens}`);

  try {
    // Only log in development
    if (import.meta.env?.DEV) {
      console.debug('Request payload:', requestPayload);
    }

    // Make secure API call
    const response = await fetch(`${API_BASE_URL}/api/claude/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'same-origin', // For CSRF protection if needed
      body: JSON.stringify(requestPayload),
    });

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: AI request failed`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // Ignore parse errors - we already have a basic error message
        console.warn('Failed to parse error response:', parseError);
      }

      throw new Error(errorMessage);
    }

    // Parse successful response
    const data = await response.json();

    if (!data.success || typeof data.response === 'undefined') {
      throw new Error('Invalid AI response format');
    }

    const responseText = data.response?.trim() || '';

    console.log(`✅ Vauntico AI: Received ${responseText.length} char response`);

    // Optional: Log usage in development
    if (import.meta.env?.DEV && data.usage) {
      console.debug('AI Usage:', data.usage);
    }

    return responseText;

  } catch (error) {
    // Distinguish network vs API errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('❌ Network error - cannot reach AI service');
      throw new Error('AI service unavailable. Please try again later.');
    }

    console.error('❌ askClaude error:', error.message);
    throw error; // Re-throw to let calling code handle UI feedback
  }
}

/**
 * Utility function to count tokens (rough approximation)
 * @param {string} text - Text to count tokens for
 * @returns {number} Approximate token count
 */
export function approximateTokens(text) {
  if (!text) return 0;

  // Rough approximation: 1 token ≈ 4 characters for English
  // Claude uses GPT-like tokenization, so this is a good enough estimate
  return Math.ceil(text.length / 4);
}

// Export for potential usage in components
export { API_BASE_URL };
