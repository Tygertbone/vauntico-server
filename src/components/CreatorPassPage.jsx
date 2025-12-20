import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Sparkles, Zap, Star, ArrowRight } from 'lucide-react'
import vaunticoBanner from '../assets/vauntico_banner.webp'

const CreatorPassPage = () => {
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    {
      icon: <Crown className="w-6 h-6 text-[var(--vauntico-gold)]" />,
      title: "Exclusive Access",
      description: "Get first access to all new vault releases and premium content"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[var(--vauntico-gold)]" />,
      title: "Founder Pricing",
      description: "Special discounts on all future products and services"
    },
    {
      icon: <Zap className="w-6 h-6 text-[var(--vauntico-gold)]" />,
      title: "Priority Support",
      description: "Direct access to our support team and community"
    },
    {
      icon: <Star className="w-6 h-6 text-[var(--vauntico-gold)]" />,
      title: "VIP Community",
      description: "Join our exclusive community of successful creators"
    }
  ]

  const handleJoinWaitlist = () => {
    setIsLoading(true)
    // Redirect to vaults page for email capture
    window.location.href = '/vaults'
  }

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
            Creator Pass
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join the exclusive circle of creators who get first access to everything Vauntico.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-[var(--vauntico-gold)] transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-[var(--vauntico-gold)] bg-opacity-10 rounded-full">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Join the Inner Circle?
              </CardTitle>
              <p className="text-lg text-gray-600">
                Be the first to know when Creator Pass launches. Join our VIP list for exclusive access.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleJoinWaitlist}
                disabled={isLoading}
                className="vauntico-btn text-lg px-8 py-4"
                aria-label="Join Creator Pass waitlist"
              >
                {isLoading ? 'Redirecting...' : 'Join Waitlist'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default CreatorPassPage