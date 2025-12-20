import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FullLogo } from '../components/Logo';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  BarChart3,
  ArrowRight,
  Star,
  CheckCircle,
  Globe,
  Rocket,
  Brain,
  Lock,
  Eye,
  Heart
} from 'lucide-react';

const Home = () => {
  const [score, setScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setScore(prev => {
        if (prev < 87) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Trust Scoring",
      description: "Advanced algorithms analyze engagement, consistency, and authenticity to generate dynamic trust scores.",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Fraud Detection",
      description: "Real-time monitoring detects suspicious patterns and protects your creator reputation.",
      gradient: "from-pink-600 to-red-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Growth Analytics",
      description: "Track your performance metrics and receive actionable insights for improvement.",
      gradient: "from-red-600 to-orange-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Building",
      description: "Connect with other creators and build collaborative relationships.",
      gradient: "from-orange-600 to-yellow-600"
    }
  ];

  const stats = [
    { label: "Creators Trusting Vauntico", value: "10K+", icon: <Users className="w-5 h-5" /> },
    { label: "Trust Score Accuracy", value: "98.7%", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Fraud Detection Rate", value: "99.2%", icon: <Shield className="w-5 h-5" /> },
    { label: "Community Growth", value: "250%", icon: <TrendingUp className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      content: "Vauntico transformed my creator journey. The trust score helped me secure brand deals!",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "YouTuber",
      content: "The fraud detection saved my channel from false claims. Incredible platform!",
      rating: 5,
      avatar: "MJ"
    },
    {
      name: "Elena Rodriguez",
      role: "Instagram Influencer",
      content: "The analytics insights helped me double my engagement in just 2 months.",
      rating: 5,
      avatar: "ER"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <FullLogo size="lg" />
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/signin" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-purple-600/20 rounded-full px-4 py-2 border border-purple-500/30">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">AI-Powered Creator Economy Platform</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-white">Build Trust in</span>
                  <span className="block text-gradient">Your Creator Journey</span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed">
                  Transform your content creation with AI-driven trust scoring, fraud detection, and growth analytics. 
                  Join thousands of creators who've elevated their digital presence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="btn-primary text-lg px-8 py-4 flex items-center justify-center group">
                  Start Building Trust
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/demo" className="btn-outline text-lg px-8 py-4 flex items-center justify-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Watch Demo
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  <span>Global platform</span>
                </div>
              </div>
            </div>

            {/* Right Content - Trust Score Demo */}
            <div className={`flex justify-center ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-30 animate-pulse-glow"></div>
                
                {/* Score Card */}
                <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 glow-card">
                  <div className="text-center space-y-6">
                    <h3 className="text-2xl font-semibold text-white">Your Trust Score</h3>
                    
                    {/* Circular Score Display */}
                    <div className="relative w-48 h-48 mx-auto">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(score / 100) * 552} 552`}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="50%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-white">{score}</div>
                        <div className="text-sm text-gray-400">/ 100</div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Authenticity</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                          </div>
                          <span className="text-green-400">92%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Consistency</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                          </div>
                          <span className="text-yellow-400">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Engagement</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-5/6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                          </div>
                          <span className="text-green-400">88%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center space-y-2 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-center text-purple-400">
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              <span className="text-white">Powerful Features for</span>
              <span className="block text-gradient">Modern Creators</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to build trust, grow your audience, and monetize your content safely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-full bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Trusted by <span className="text-gradient">Creators Worldwide</span>
            </h2>
            <p className="text-xl text-gray-300">See what our community has to say about Vauntico</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-300 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
            
            <div className="relative z-10 space-y-6">
              <Rocket className="w-16 h-16 text-white mx-auto animate-bounce" />
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Ready to Build Your Trust Score?
              </h2>
              <p className="text-xl text-white/90">
                Join thousands of creators who've already transformed their digital presence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
                  Start Free Trial
                </Link>
                <Link to="/demo" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <FullLogo size="md" />
              <p className="text-gray-400">
                AI-powered trust scoring for the creator economy. Build credibility, grow your audience, monetize safely.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2">
                <Link to="/features" className="block text-gray-400 hover:text-white transition-colors">Features</Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link to="/dashboard" className="block text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About</Link>
                <Link to="/blog" className="block text-gray-400 hover:text-white transition-colors">Blog</Link>
                <Link to="/careers" className="block text-gray-400 hover:text-white transition-colors">Careers</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2">
                <Link to="/help" className="block text-gray-400 hover:text-white transition-colors">Help Center</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
                <Link to="/status" className="block text-gray-400 hover:text-white transition-colors">Status</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Vauntico AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
