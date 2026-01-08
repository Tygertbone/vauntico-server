// Mock Paystack integration for development
export const mockPaystackCheckout = async (tier, billingCycle, userEmail) => {
  console.log('🧪 Mock Paystack checkout initiated:', { tier, billingCycle, userEmail })
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // In development, just log and redirect
  console.log('✅ Mock payment successful!')
  
  // Redirect to success page (in real app, this would be Paystack redirect)
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard'
  }
}

export const isPaystackConfigured = () => {
  // Check if Paystack is configured (mock for development)
  return process.env.NODE_ENV === 'development' || !process.env.REACT_APP_PAYSTACK_PUBLIC_KEY
}

export const checkoutCreatorPass = async (tier, billingCycle, userEmail) => {
  console.log('🧪 Mock Paystack checkout initiated:', { tier, billingCycle, userEmail })
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // In development, just log and redirect
  console.log('✅ Mock payment successful!')
  
  // Redirect to success page (in real app, this would be Paystack redirect)
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard'
  }
}
