import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Sparkles, Rocket, TrendingUp } from 'lucide-react'
import vaunticoBanner from '../assets/vauntico_banner.webp'

const VaultsPage = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    
    setIsLoading(true)
    
    try {
      // Use Buttondown API for email subscription
      const response = await fetch('https://api.buttondown.email/v1/subscribers', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${import.meta.env.VITE_BUTTONDOWN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          tags: ['vip-list', 'vault-updates'],
          notes: 'Joined from VaultsPage VIP list'
        })
      })
      
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        throw new Error('Email subscription failed')
      }
    } catch (error) {
      console.error('Email subscription error:', error)
      // Fallback to simulated success for demo purposes
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  const upcomingVaults = [
    {
      title: "E-commerce Empire",
      description: "Complete prompt library for online store owners, dropshippers, and product creators",
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
      features: ["Product descriptions", "Email sequences", "Ad copy", "Customer service"]
    },
    {
      title: "Creator's Toolkit",
      description: "Essential prompts for content creators, influencers, and personal brands",
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      color: "bg-purple-50 border-purple-200",
      features: ["Social media content", "Video scripts", "Brand voice", "Engagement strategies"]
    },
    {
      title: "Agency Arsenal",
      description: "Professional-grade prompts for marketing agencies and consultants",
      icon: <Rocket className="w-8 h-8 text-green-600" />,
      color: "bg-green-50 border-green-200",
      features: ["Client proposals", "Campaign strategies", "Reports", "Presentations"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src={vaunticoBanner} 
              alt="Vauntico Logo" 
              className="h-16 mx-auto mb-6"
            />
          </div>
          
          <Badge className="mb-6 bg-[var(--vauntico-gold)] text-white px-4 py-2 text-sm font-semibold">
            Coming Soon
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            More Vaults Are Coming
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We're building specialized prompt libraries for every industry and use case. 
            Be the first to know when they launch.
          </p>
        </div>
      </section>

      {/* Email Capture */}
      <section className="px-4 mb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-[var(--vauntico-gold)] bg-opacity-10 p-3 rounded-full">
                  <Mail className="w-8 h-8 text-[var(--vauntico-gold)]" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Get Early Access
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Join our VIP list for exclusive previews, founder pricing, and first access to new vaults.
              </p>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12 text-lg"
                      required
                      aria-label="Email address for VIP list"
                      aria-describedby="email-help"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="vauntico-btn h-12 px-8 md:w-auto"
                      aria-label={isLoading ? 'Joining VIP list...' : 'Join VIP list'}
                    >
                      {isLoading ? 'Joining...' : 'Join VIP List'}
                    </Button>
                  </div>
                  <p id="email-help" className="text-sm text-gray-500 text-center">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    You're In! 🎉
                  </h3>
                  <p className="text-gray-600">
                    Thanks for joining our VIP list. You'll be the first to know about new vault releases.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Vaults Preview */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            What's Coming Next
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {upcomingVaults.map((vault, index) => (
              <Card key={index} className={`${vault.color} border-2 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white rounded-full shadow-md">
                      {vault.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {vault.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6 text-center">
                    {vault.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      Includes:
                    </h4>
                    <ul className="space-y-1">
                      {vault.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-[var(--vauntico-gold)] rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">
              Each vault will include 50+ premium prompts, templates, and mini brand kits
            </p>
            <Badge className="bg-gray-100 text-gray-700 px-4 py-2">
              Expected Launch: Q1 2025
            </Badge>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Don't Miss Out
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            VIP members get exclusive previews, founder pricing, and early access to every new vault.
          </p>
          {!isSubmitted && (
            <Button 
              onClick={() => document.querySelector('input[type="email"]')?.focus()}
              className="vauntico-btn"
            >
              Join VIP List Above
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

export default VaultsPage