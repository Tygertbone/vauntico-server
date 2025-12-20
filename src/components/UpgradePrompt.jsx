import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, X, Check, Star } from 'lucide-react';

const UpgradePrompt = ({
  title = "Unlock Premium Features",
  message = "Upgrade to Creator Pass to access unlimited vaults, advanced analytics, and priority support.",
  className = "",
  compact = false
}) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (dismissed) return null;

  const premiumFeatures = [
    "Unlimited AI generations",
    "Advanced analytics dashboard",
    "Custom branding",
    "Priority email support",
    "Unlimited vaults",
    compact ? null : "Team collaboration tools",
    compact ? null : "API access",
    compact ? null : "White-label options"
  ].filter(Boolean);

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-vault-purple/10 to-vault-blue/10 border border-vault-purple/20 rounded-lg p-4 mb-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-vault-purple" />
            <h4 className="font-semibold text-vault-purple">{title}</h4>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">{message}</p>
        <button
          onClick={handleUpgrade}
          className="btn-primary text-sm py-2 px-4 w-full"
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Upgrade Now
        </button>
      </div>
    );
  }

  return (
    <div className={`vault-gradient rounded-2xl p-8 text-white relative overflow-hidden ${className}`}>
      {/* Background pattern */}
      <div className="absolute top-0 right-0 opacity-10">
        <Crown className="w-32 h-32 transform rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Crown className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-xl opacity-90 mb-6 max-w-2xl">
          {message}
        </p>

        {/* Feature comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="bg-white/20 rounded-full p-1 mr-2">
                <Check className="w-4 h-4" />
              </span>
              Creator Pass Includes:
            </h3>
            <ul className="space-y-2">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-green-300" />
                  <span className="opacity-90">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <div className="bg-white/10 rounded-lg p-6 mb-4">
              <div className="text-3xl font-bold mb-2">$29/month</div>
              <div className="text-sm opacity-75 mb-4">or $299/year (20% off)</div>
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-4 h-4 fill-current text-yellow-300" />
                ))}
                <span className="text-sm ml-2 opacity-90">4.9/5 from creators</span>
              </div>
              <div className="text-sm opacity-70">
                14-day free trial • Cancel anytime • No setup fees
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleUpgrade}
            className="bg-white text-vault-purple hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex-1 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Free Trial (14 Days)
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex-1"
          >
            View All Plans
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-sm opacity-70 text-center">
            Join 2,500+ creators already using Vauntico
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
