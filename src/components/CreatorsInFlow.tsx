import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Heart, Sparkles } from 'lucide-react';
import { CustomIcons } from './CustomIcons';

const creators = [
  {
    id: 1,
    name: "Maya Chen",
    role: "Digital Artist & Coach",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    testimonial: "Vauntico transformed my scattered creative energy into a thriving ecosystem. I tripled my income in just one week while staying true to my artistic vision.",
    metrics: { income: "3x", time: "1 week", trust: "98%" },
    journey: "From struggling artist to creative entrepreneur",
    vibe: "meditative-abundance"
  },
  {
    id: 2,
    name: "Kwame Asante",
    role: "Tech Educator",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    testimonial: "The trust scoring system gave me credibility I never knew I had. My workshops are now consistently sold out with waiting lists.",
    metrics: { income: "2.5x", time: "2 weeks", trust: "95%" },
    journey: "From side-hustle to full-time creator",
    vibe: "innovative-flow"
  },
  {
    id: 3,
    name: "Sofia Martinez",
    role: "Yoga Instructor & Author",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    testimonial: "The sacred approach to business building resonated deeply with my values. I built a wellness empire without compromising my peace.",
    metrics: { income: "4x", time: "3 weeks", trust: "99%" },
    journey: "From local studio to global community",
    vibe: "peaceful-prosperity"
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Music Producer",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    testimonial: "Finally, a platform that understands the creative soul. My beats now reach millions while maintaining artistic integrity.",
    metrics: { income: "5x", time: "1 month", trust: "97%" },
    journey: "From bedroom producer to music mogul",
    vibe: "rhythmic-abundance"
  }
];

const journeyVideo = {
  title: "From Idea to Income",
  description: "Watch real creators transform their passion into prosperity",
  thumbnail: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=450&fit=crop",
  duration: "4:32"
};

export default function CreatorsInFlow() {
  const [currentCreator, setCurrentCreator] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentCreator((prev) => (prev + 1) % creators.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextCreator = () => {
    setCurrentCreator((prev) => (prev + 1) % creators.length);
  };

  const prevCreator = () => {
    setCurrentCreator((prev) => (prev - 1 + creators.length) % creators.length);
  };

  const creator = creators[currentCreator];

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-green-900/10" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <CustomIcons.HeartVine className="w-8 h-8 text-pink-400" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Creators In Flow
            </h2>
            <CustomIcons.HeartVine className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real creators building real legacies through sacred technology and authentic connection
          </p>
        </div>

        {/* Main Creator Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Creator Card */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 relative overflow-hidden">
              {/* Sacred Geometry Background */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <CustomIcons.SacredGeometry className="w-full h-full text-purple-400" />
              </div>
              
              {/* Creator Info */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <img 
                    src={creator.photo} 
                    alt={creator.name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-400/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{creator.name}</h3>
                  <p className="text-gray-400">{creator.role}</p>
                </div>
              </div>

              {/* Testimonial */}
              <blockquote className="text-lg text-gray-300 italic mb-6 leading-relaxed">
                "{creator.testimonial}"
              </blockquote>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">{creator.metrics.income}</div>
                  <div className="text-sm text-gray-400">Income Growth</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">{creator.metrics.time}</div>
                  <div className="text-sm text-gray-400">Time to Result</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{creator.metrics.trust}</div>
                  <div className="text-sm text-gray-400">Trust Score</div>
                </div>
              </div>

              {/* Journey */}
              <div className="flex items-center space-x-2 text-gray-400">
                <CustomIcons.LegacyTree className="w-4 h-4" />
                <span className="text-sm">{creator.journey}</span>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={prevCreator}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous creator"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex space-x-2">
                {creators.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCreator(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentCreator 
                        ? 'bg-white w-8' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to creator ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextCreator}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next creator"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Journey Video */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
              <div className="relative aspect-video">
                <img 
                  src={journeyVideo.thumbnail}
                  alt={journeyVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="group relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-colors" />
                    <div className="relative w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </button>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                  <span className="text-white text-sm">{journeyVideo.duration}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{journeyVideo.title}</h3>
                <p className="text-gray-400">{journeyVideo.description}</p>
              </div>
            </div>

            {/* Ubuntu Quote */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-400/20">
              <div className="flex items-center space-x-3 mb-3">
                <CustomIcons.Ubuntu className="w-6 h-6 text-purple-400" />
                <Star className="w-5 h-5 text-yellow-400" />
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <blockquote className="text-gray-300 italic">
                "When one creator rises, we all rise together. Your success is our collective abundance."
              </blockquote>
            </div>
          </div>
        </div>

        {/* Creator Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {creators.map((c, index) => (
            <button
              key={c.id}
              onClick={() => setCurrentCreator(index)}
              className={`group relative p-4 rounded-2xl border transition-all ${
                index === currentCreator
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <img 
                src={c.photo} 
                alt={c.name}
                className="w-full aspect-square object-cover rounded-xl mb-3"
              />
              <h4 className="font-semibold text-white text-sm">{c.name}</h4>
              <p className="text-xs text-gray-400">{c.role}</p>
              {index === currentCreator && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
