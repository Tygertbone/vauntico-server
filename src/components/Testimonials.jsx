function Testimonials({ variant = 'grid', limit = 3 }) {
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
  ]

  const displayTestimonials = testimonials.slice(0, limit)

  if (variant === 'grid') {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {displayTestimonials.map((testimonial, index) => (
          <div 
            key={index}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
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
                <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9l-1.55-2.58L12 17l-8.45 7.59L2 9l1.55 2.58z" />
                </svg>
              ))}
            </div>
            
            <p className="text-gray-300 italic">"{testimonial.content}"</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {displayTestimonials.map((testimonial, index) => (
        <div 
          key={index}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all max-w-2xl mx-auto"
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
              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9l-1.55-2.58L12 17l-8.45 7.59L2 9l1.55 2.58z" />
                </svg>
            ))}
          </div>
          
          <p className="text-gray-300 italic">"{testimonial.content}"</p>
        </div>
      ))}
    </div>
  )
}

export default Testimonials
