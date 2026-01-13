import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import { FullLogo } from "./components/Logo";
import ThemeToggle from "./components/ThemeToggle";
import CookieConsentBanner from "./components/CookieConsentBanner";

// Eager load homepage (critical)
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Lazy load legal pages
const Terms = lazy(() => import("./pages/legal/Terms"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));

// Lazy load all other pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreatorPass = lazy(() => import("./pages/CreatorPass"));
const Vaults = lazy(() => import("./pages/Vaults"));
const DreamMover = lazy(() => import("./pages/DreamMover"));
const Pricing = lazy(() => import("./pages/Pricing"));
const WorkshopKit = lazy(() => import("./pages/WorkshopKit"));

const AuditService = lazy(() => import("./pages/AuditService"));
const Addons = lazy(() => import("./pages/Addons"));
const LoreVault = lazy(() => import("./pages/LoreVault"));
const Ascend = lazy(() => import("./pages/Ascend"));

const About = lazy(() => import("./pages/About"));
const Philosophy = lazy(() => import("./pages/Philosophy"));
const Referrals = lazy(() => import("./pages/Referrals"));

// Service landing pages
const PaymentBridgeLanding = lazy(() => import("./pages/PaymentBridgeLanding"));
const VerificationLanding = lazy(() => import("./pages/VerificationLanding"));
const ContentRecoveryLanding = lazy(
  () => import("./pages/ContentRecoveryLanding"),
);

// Service pages (require auth)
const PaymentBridge = lazy(() => import("./pages/PaymentBridge"));
const Verification = lazy(() => import("./pages/Verification"));

// New sacred pages
const LegacyTree = lazy(() => import("./pages/LegacyTree"));
const CodeSanctification = lazy(() => import("./pages/CodeSanctification"));
const UbuntuEchoChamber = lazy(() => import("./pages/UbuntuEchoChamber"));
const LoveLoopsCanvas = lazy(() => import("./pages/LoveLoopsCanvas"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" color="purple" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesDropdownOpen && !event.target.closest(".services-dropdown")) {
        setServicesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [servicesDropdownOpen]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Skip to main content link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-vault-purple text-white px-4 py-2 rounded-lg"
          >
            Skip to main content
          </a>

          {/* Navigation */}
          <nav
            className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link
                    to="/"
                    className="flex items-center"
                    aria-label="Vauntico home"
                  >
                    <FullLogo size="md" />
                  </Link>
                </div>

                <div className="hidden lg:flex items-center space-x-6">
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-vault-purple font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/creator-pass"
                    className="text-gray-700 hover:text-vault-purple font-medium transition-colors"
                  >
                    Creator Pass
                  </Link>
                  <Link
                    to="/vaults"
                    className="text-gray-700 hover:text-vault-purple font-medium transition-colors"
                  >
                    Vaults
                  </Link>
                  <Link
                    to="/pricing"
                    className="text-gray-700 hover:text-vault-purple font-medium transition-colors"
                  >
                    Pricing
                  </Link>

                  {/* Services Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setServicesDropdownOpen(!servicesDropdownOpen)
                      }
                      className="text-gray-700 hover:text-vault-purple font-medium transition-colors flex items-center gap-1"
                      aria-label="Services menu"
                      aria-expanded={servicesDropdownOpen}
                    >
                      Services
                      <svg
                        className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {servicesDropdownOpen && (
                      <div className="services-dropdown absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          <Link
                            to="/services/payment-bridge"
                            className="block px-4 py-3 text-gray-700 hover:bg-vault-purple hover:text-white transition-colors"
                            onClick={() => setServicesDropdownOpen(false)}
                          >
                            <div className="font-medium">Payment Bridge</div>
                            <div className="text-sm text-gray-500">
                              Cross-border payments for creators
                            </div>
                          </Link>
                          <Link
                            to="/services/verification"
                            className="block px-4 py-3 text-gray-700 hover:bg-vault-purple hover:text-white transition-colors"
                            onClick={() => setServicesDropdownOpen(false)}
                          >
                            <div className="font-medium">
                              Creator Verification
                            </div>
                            <div className="text-sm text-gray-500">
                              Build trust with brands
                            </div>
                          </Link>
                          <Link
                            to="/services/content-recovery"
                            className="block px-4 py-3 text-gray-700 hover:bg-vault-purple hover:text-white transition-colors"
                            onClick={() => setServicesDropdownOpen(false)}
                          >
                            <div className="font-medium">Content Recovery</div>
                            <div className="text-sm text-gray-500">
                              Recover stolen content revenue
                            </div>
                          </Link>
                          <div className="border-t border-gray-200 mt-2 pt-2">
                            <Link
                              to="/workshop-kit"
                              className="block px-4 py-3 text-gray-700 hover:bg-vault-purple hover:text-white transition-colors"
                              onClick={() => setServicesDropdownOpen(false)}
                            >
                              <div className="font-medium">Workshop Kit</div>
                              <div className="text-sm text-gray-500">
                                Creator education resources
                              </div>
                            </Link>
                            <Link
                              to="/audit-service"
                              className="block px-4 py-3 text-gray-700 hover:bg-vault-purple hover:text-white transition-colors"
                              onClick={() => setServicesDropdownOpen(false)}
                            >
                              <div className="font-medium">Audit Service</div>
                              <div className="text-sm text-gray-500">
                                Content performance analysis
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/legacy-tree"
                    className="text-gray-700 hover:text-vault-purple font-medium transition-colors"
                  >
                    Legacy Tree
                  </Link>
                  <Link
                    to="/code-sanctification"
                    className="text-gray-700 hover:text-vault-purple font-medium transition-colors"
                  >
                    Code Sanctification
                  </Link>
                  <Link
                    to="/ubuntu-echo"
                    className="text-gray-700 hover:text-vault-purple font-medium transition-colors"
                  >
                    Ubuntu Echo
                  </Link>
                  <Link
                    to="/love-loops"
                    className="text-gray-700 hover:text-vault-purple font-medium transition-colors"
                  >
                    Love Loops
                  </Link>
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center lg:hidden">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Toggle mobile menu"
                    aria-expanded={mobileMenuOpen}
                  >
                    {mobileMenuOpen ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Desktop CTA buttons */}
                <div className="hidden lg:flex items-center space-x-4">
                  <ThemeToggle />
                  <Link
                    to="/signin"
                    className="btn-outline text-sm"
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-sm"
                    aria-label="Get started with Vauntico"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div
                className="lg:hidden border-t border-gray-200 bg-white"
                role="dialog"
                aria-label="Mobile navigation menu"
              >
                <div className="px-4 py-6 space-y-4">
                  <Link
                    to="/"
                    className="block text-gray-700 hover:text-vault-purple font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/creator-pass"
                    className="block text-gray-700 hover:text-vault-purple font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Creator Pass
                  </Link>
                  <Link
                    to="/vaults"
                    className="block text-gray-700 hover:text-vault-purple font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Vaults
                  </Link>
                  <Link
                    to="/pricing"
                    className="block text-gray-700 hover:text-vault-purple font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>

                  {/* Mobile Services Section */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="font-medium text-gray-900 mb-3">
                      Services
                    </div>
                    <div className="space-y-2">
                      <Link
                        to="/services/payment-bridge"
                        className="block text-gray-600 hover:text-vault-purple font-medium transition-colors py-2 pl-4"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Payment Bridge
                      </Link>
                      <Link
                        to="/services/verification"
                        className="block text-gray-600 hover:text-vault-purple font-medium transition-colors py-2 pl-4"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Creator Verification
                      </Link>
                      <Link
                        to="/services/content-recovery"
                        className="block text-gray-600 hover:text-vault-purple font-medium transition-colors py-2 pl-4"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Content Recovery
                      </Link>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <Link
                          to="/workshop-kit"
                          className="block text-gray-600 hover:text-vault-purple font-medium transition-colors py-2 pl-4"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Workshop Kit
                        </Link>
                        <Link
                          to="/audit-service"
                          className="block text-gray-600 hover:text-vault-purple font-medium transition-colors py-2 pl-4"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Audit Service
                        </Link>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/legacy-tree"
                    className="block text-gray-700 hover:text-vault-purple font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Legacy Tree
                  </Link>
                  <Link
                    to="/code-sanctification"
                    className="block text-gray-700 hover:text-vault-purple font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Code Sanctification
                  </Link>
                  <Link
                    to="/ubuntu-echo"
                    className="block text-gray-700 hover:text-vault-purple font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ubuntu Echo
                  </Link>
                  <Link
                    to="/love-loops"
                    className="block text-gray-700 hover:text-vault-purple font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Love Loops
                  </Link>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Theme</span>
                      <ThemeToggle />
                    </div>
                    <Link
                      to="/signin"
                      className="btn-outline w-full text-center"
                      aria-label="Sign in to your account"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="btn-primary w-full text-center"
                      aria-label="Get started with Vauntico"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Main Content */}
          <main id="main-content" className="animate-fade-in">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/creator-pass" element={<CreatorPass />} />
                <Route path="/vaults" element={<Vaults />} />
                <Route path="/dream-mover" element={<DreamMover />} />
                <Route path="/workshop-kit" element={<WorkshopKit />} />

                <Route path="/audit-service" element={<AuditService />} />
                <Route path="/addons" element={<Addons />} />
                <Route path="/payment-bridge" element={<PaymentBridge />} />
                <Route path="/verification" element={<Verification />} />

                {/* Service landing pages */}
                <Route
                  path="/services/payment-bridge"
                  element={<PaymentBridgeLanding />}
                />
                <Route
                  path="/services/verification"
                  element={<VerificationLanding />}
                />
                <Route
                  path="/services/content-recovery"
                  element={<ContentRecoveryLanding />}
                />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/lore" element={<LoreVault />} />
                <Route path="/ascend" element={<Ascend />} />
                <Route path="/about" element={<About />} />
                <Route path="/philosophy" element={<Philosophy />} />
                <Route path="/referrals" element={<Referrals />} />

                {/* Legal Pages */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* New Sacred Features */}
                <Route path="/legacy-tree" element={<LegacyTree />} />
                <Route
                  path="/code-sanctification"
                  element={<CodeSanctification />}
                />
                <Route path="/ubuntu-echo" element={<UbuntuEchoChamber />} />
                <Route path="/love-loops" element={<LoveLoopsCanvas />} />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          {/* Footer */}
          <footer className="bg-vault-dark text-white mt-20" role="contentinfo">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="mb-4">
                    <FullLogo size="md" />
                  </div>
                  <p className="text-gray-400 max-w-md">
                    AI-powered content creation platform. Create, collaborate,
                    and monetize your content with intelligent vault technology.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Product</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>
                      <Link
                        to="/creator-pass"
                        className="hover:text-white transition-colors"
                      >
                        Creator Pass
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/vaults"
                        className="hover:text-white transition-colors"
                      >
                        Vaults
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dream-mover"
                        className="hover:text-white transition-colors"
                      >
                        Dream Mover
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/pricing"
                        className="hover:text-white transition-colors"
                      >
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/lore"
                        className="hover:text-white transition-colors"
                      >
                        Lore Vault
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/ascend"
                        className="hover:text-white transition-colors"
                      >
                        Ascend
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Sacred Features</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>
                      <Link
                        to="/legacy-tree"
                        className="hover:text-white transition-colors"
                      >
                        Legacy Tree
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/code-sanctification"
                        className="hover:text-white transition-colors"
                      >
                        Code Sanctification
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/ubuntu-echo"
                        className="hover:text-white transition-colors"
                      >
                        Ubuntu Echo Chamber
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/love-loops"
                        className="hover:text-white transition-colors"
                      >
                        Love Loops Canvas
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Services</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>
                      <Link
                        to="/services/payment-bridge"
                        className="hover:text-white transition-colors"
                      >
                        Payment Bridge
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/services/verification"
                        className="hover:text-white transition-colors"
                      >
                        Creator Verification
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/services/content-recovery"
                        className="hover:text-white transition-colors"
                      >
                        Content Recovery
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/workshop-kit"
                        className="hover:text-white transition-colors"
                      >
                        Workshop Kit
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/audit-service"
                        className="hover:text-white transition-colors"
                      >
                        Audit Service
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/addons"
                        className="hover:text-white transition-colors"
                      >
                        Add-ons
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>
                      <Link
                        to="/about"
                        className="hover:text-white transition-colors"
                      >
                        About
                      </Link>
                    </li>
                    <li>
                      <a
                        href="mailto:hello@vauntico.com"
                        className="hover:text-white transition-colors"
                      >
                        Contact
                      </a>
                    </li>
                    <li>
                      <Link
                        to="/ascend"
                        className="hover:text-white transition-colors"
                      >
                        Ascend
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/terms"
                        className="hover:text-white transition-colors"
                      >
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/privacy"
                        className="hover:text-white transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                <p className="text-gray-400">
                  &copy; 2024 Vauntico. Built with Ubuntu spirit.
                  <span className="text-purple-400 ml-2">EA + ENKI = AI</span>
                </p>
                <p className="text-gray-500 text-sm mt-2 italic">
                  "We live by what we give"
                </p>
              </div>
            </div>
          </footer>

          {/* Cookie Consent Banner */}
          <CookieConsentBanner />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
