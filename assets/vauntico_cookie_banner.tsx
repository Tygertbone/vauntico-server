import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("vauntico_cookie_consent");
    if (!consent) {
      // Delay showing banner slightly for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      const saved = JSON.parse(consent);
      setPreferences(saved);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const acceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(essentialOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
    setShowPreferences(false);
  };

  const savePreferences = (prefs: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => {
    localStorage.setItem("vauntico_cookie_consent", JSON.stringify(prefs));
    localStorage.setItem("vauntico_consent_date", new Date().toISOString());
    setShowBanner(false);

    // Initialize analytics if accepted
    if (prefs.analytics) {
      initializeAnalytics();
    }
  };

  const initializeAnalytics = () => {
    // Initialize Google Analytics or other services here
    // Analytics would be initialized here in production
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden">
            {!showPreferences ? (
              // Main Banner
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      We use cookies to enhance your experience, analyze site
                      traffic, and personalize content. By clicking "Accept
                      All", you consent to our use of cookies.{" "}
                      <a
                        href="/privacy"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Learn more
                      </a>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={acceptAll}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Accept All
                      </button>
                      <button
                        onClick={acceptEssential}
                        className="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                      >
                        Essential Only
                      </button>
                      <button
                        onClick={() => setShowPreferences(true)}
                        className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-slate-300 transition-all"
                      >
                        Customize
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={acceptEssential}
                    className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Close and accept essential only"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
            ) : (
              // Preferences Panel
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Essential Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="flex-shrink-0 pt-1">
                      <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-not-allowed">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">
                          Essential Cookies
                        </h4>
                        <span className="text-xs px-2 py-1 bg-slate-200 rounded-full font-medium">
                          Required
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Required for the website to function. These cannot be
                        disabled.
                      </p>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl">
                    <div className="flex-shrink-0 pt-1">
                      <button
                        onClick={() =>
                          setPreferences((p) => ({
                            ...p,
                            analytics: !p.analytics,
                          }))
                        }
                        className={`w-12 h-6 rounded-full relative transition-all ${
                          preferences.analytics ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            preferences.analytics ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">
                        Analytics Cookies
                      </h4>
                      <p className="text-sm text-slate-600">
                        Help us understand how visitors use our website to
                        improve the experience.
                      </p>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl">
                    <div className="flex-shrink-0 pt-1">
                      <button
                        onClick={() =>
                          setPreferences((p) => ({
                            ...p,
                            marketing: !p.marketing,
                          }))
                        }
                        className={`w-12 h-6 rounded-full relative transition-all ${
                          preferences.marketing ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            preferences.marketing ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">
                        Marketing Cookies
                      </h4>
                      <p className="text-sm text-slate-600">
                        Used to deliver personalized ads and track campaign
                        effectiveness.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={saveCustomPreferences}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                  >
                    Accept All
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-4 text-center">
                  You can change your preferences at any time in your account
                  settings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-from-bottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-bottom {
          animation-name: slide-in-from-bottom;
        }
        
        .fade-in {
          animation-name: fade-in;
        }
        
        .duration-300 {
          animation-duration: 300ms;
        }
        
        .duration-500 {
          animation-duration: 500ms;
        }
      `}</style>
    </>
  );
};

export default CookieConsentBanner;
