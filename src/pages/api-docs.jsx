import React, { useState } from "react";
import {
  Shield,
  Code,
  Database,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Key,
} from "lucide-react";

const APIDocs = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const apiEndpoints = [
    {
      method: "GET",
      path: "/api/v1/trust-lineage/:userId",
      description: "Retrieve trust lineage data for a specific user",
      enterpriseName: "Trust Lineage",
      sacredName: "Legacy Tree",
    },
    {
      method: "GET",
      path: "/api/v1/credibility-circles/:userId",
      description: "Get credibility circles and engagement patterns",
      enterpriseName: "Credibility Circles",
      sacredName: "Love Loops",
    },
    {
      method: "POST",
      path: "/api/v1/narrative-engine",
      description: "Generate AI-powered narratives from trust data",
      enterpriseName: "Narrative Engine",
      sacredName: "Lore Generator",
    },
    {
      method: "GET",
      path: "/api/v1/community-resonance",
      description: "Access collective creator wisdom and insights",
      enterpriseName: "Community Resonance",
      sacredName: "Ubuntu Echo Chamber",
    },
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$99/month",
      requests: "1,000/month",
      features: ["Basic trust scoring", "Standard support", "API access"],
    },
    {
      name: "Professional",
      price: "$299/month",
      requests: "10,000/month",
      features: [
        "Advanced analytics",
        "Priority support",
        "Custom integrations",
        "Webhook access",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      requests: "Unlimited",
      features: [
        "Unlimited requests",
        "Dedicated support",
        "Custom solutions",
        "SLA guarantees",
      ],
    },
  ];

  const codeExamples = {
    javascript: `// Example: Get Trust Lineage
const apiKey = 'your-api-key-here';

fetch('/api/v1/trust-lineage/user123', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Trust Lineage:', data);
})
.catch(error => console.error('Error:', error));`,
    python: `# Example: Get Trust Lineage
import requests

api_key = 'your-api-key-here'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.vauntico.com/api/v1/trust-lineage/user123',
    headers=headers
)

if response.status_code == 200:
    trust_data = response.json()
    print(f"Trust Lineage: {trust_data}")
else:
    print(f"Error: {response.status_code}")`,
    curl: `# Example: Get Trust Lineage
curl -X GET \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  https://api.vauntico.com/api/v1/trust-lineage/user123`,
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3 text-xl font-bold text-gray-900">
                Vauntico API
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveSection("overview")}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeSection === "overview"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-purple-600 border-b-2 border-transparent"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection("endpoints")}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeSection === "endpoints"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-purple-600 border-b-2 border-transparent"
                }`}
              >
                Endpoints
              </button>
              <button
                onClick={() => setActiveSection("authentication")}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeSection === "authentication"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-purple-600 border-b-2 border-transparent"
                }`}
              >
                Authentication
              </button>
              <button
                onClick={() => setActiveSection("pricing")}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeSection === "pricing"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-purple-600 border-b-2 border-transparent"
                }`}
              >
                Pricing
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() =>
                  setActiveSection(
                    activeSection === "mobile-menu" ? null : "mobile-menu",
                  )
                }
                className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Section */}
        <section id="overview" className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Enterprise API Documentation
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Embed trust scores in your platform with our professional API
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Comprehensive API</h3>
              <p className="text-gray-600">
                Access all trust scoring features through our RESTful API
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Real-time Processing</h3>
              <p className="text-gray-600">
                Get instant trust scores with low-latency responses
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Scalable Infrastructure
              </h3>
              <p className="text-gray-600">
                Built to handle enterprise-scale workloads
              </p>
            </div>
          </div>
        </section>

        {/* Endpoints Section */}
        <section id="endpoints" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">API Endpoints</h2>
            <p className="text-lg text-gray-600">
              Enterprise naming with sacred feature equivalents
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Path
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enterprise Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sacred Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiEndpoints.map((endpoint, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            endpoint.method === "GET"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }}`}
                        >
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-purple-600">
                          {endpoint.path}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {endpoint.enterpriseName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">
                          {endpoint.sacredName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600">{endpoint.description}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section id="authentication" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">Authentication</h2>
            <p className="text-lg text-gray-600">
              Secure API access with JWT tokens
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">API Key Authentication</h3>
              <p className="text-gray-600 mb-4">
                Include your API key in the Authorization header for all
                requests:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <code className="text-sm text-gray-800">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Generate API keys in your account dashboard
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">
                Security Best Practices
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Use HTTPS for all API requests
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Store API keys securely</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Rotate keys regularly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Use rate limiting</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Code Examples Section */}
        <section id="code-examples" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">Code Examples</h2>
            <p className="text-lg text-gray-600">
              Integration examples in multiple languages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(codeExamples).map(([language, code]) => (
              <div
                key={language}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold capitalize">{language}</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">API Pricing</h2>
            <p className="text-lg text-gray-600">
              Flexible plans for businesses of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg p-8 border-2 ${
                  tier.name === "Professional"
                    ? "border-purple-600"
                    : "border-gray-200"
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    {tier.price}
                  </div>
                  <p className="text-gray-600">
                    {tier.requests} requests/month
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    tier.name === "Professional"
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-black mb-4">
            Ready to Integrate Trust Scoring?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join leading platforms that use Vauntico for creator verification
            and trust scoring
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              Get API Key
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
              Contact Sales
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default APIDocs;
