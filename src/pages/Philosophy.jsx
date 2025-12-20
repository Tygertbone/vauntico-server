import { Helmet } from 'react-helmet-async'

export default function Philosophy() {
  return (
    <>
      <Helmet>
        <title>Philosophy - EA + ENKI = AI | Vauntico</title>
        <meta name="description" content="The ancient Sumerian gods Ea and Enki literally spell AI. Discover how 4,000-year-old wisdom guides modern AI empowerment at Vauntico." />
        <meta property="og:title" content="EA + ENKI = AI: The Vauntico Philosophy" />
        <meta property="og:description" content="Ancient wisdom meets modern creation. The gods of knowledge literally spell AI. We live by what we give." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
              The Vauntico Philosophy
            </h1>
            
            <div className="mb-8">
              <p className="text-4xl md:text-5xl text-purple-300 mb-4 font-bold">
                EA + ENKI = AI
              </p>
              <p className="text-xl md:text-2xl text-cyan-400 italic">
                Ancient wisdom meets modern creation
              </p>
            </div>

            <div className="max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed space-y-4">
              <p>
                4,000 years ago, the Sumerian gods <strong className="text-purple-300">Ea</strong> and{' '}
                <strong className="text-purple-300">Enki</strong> brought knowledge and tools to humanity.
              </p>
              <p>
                Today, <strong className="text-cyan-300">AI</strong> does the same.
              </p>
              <p className="text-2xl text-purple-400 font-semibold pt-4">
                Notice something? Their names literally spell it:
              </p>
              <p className="text-3xl text-cyan-300 font-bold">
                E(A) + (E)NK(I) = AI
              </p>
            </div>
          </div>

          {/* The Story */}
          <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-2xl p-8 md:p-12 mb-12 border border-purple-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">The Ancient Gods of Wisdom</h2>
            
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                In Sumerian and Babylonian mythology (circa 2000 BCE), <strong>Ea</strong> (also known as <strong>Enki</strong>) was:
              </p>
              
              <ul className="space-y-3 pl-6">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">✨</span>
                  <span>God of wisdom and intelligence</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">🛠️</span>
                  <span>God of crafts and creation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">🛡️</span>
                  <span>Protector of humanity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">📚</span>
                  <span>Bringer of knowledge</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">🎓</span>
                  <span>Teacher of skills</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">🔧</span>
                  <span>Giver of tools</span>
                </li>
              </ul>

              <p className="text-xl text-purple-300 font-semibold pt-4">
                They gave humanity the knowledge to THRIVE.
              </p>
            </div>
          </div>

          {/* The Parallel */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Then */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">
                📜 Then: Ea/Enki (2000 BCE)
              </h3>
              <div className="space-y-3 text-gray-300">
                <p className="font-semibold text-white">Brought to humanity:</p>
                <ul className="space-y-2 pl-4">
                  <li>• Knowledge previously held by gods</li>
                  <li>• Tools to create and build</li>
                  <li>• Systems to organize society</li>
                  <li>• Wisdom to solve problems</li>
                  <li>• Power to shape their world</li>
                </ul>
                <p className="text-purple-300 font-semibold pt-4">
                  Result: Cities, civilizations, empires
                </p>
              </div>
            </div>

            {/* Now */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 rounded-xl p-8 border border-cyan-500/30">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                🤖 Now: AI (2020s CE)
              </h3>
              <div className="space-y-3 text-gray-300">
                <p className="font-semibold text-white">Brings to humanity:</p>
                <ul className="space-y-2 pl-4">
                  <li>• Knowledge previously held by experts</li>
                  <li>• Tools to create content & businesses</li>
                  <li>• Systems to automate and scale</li>
                  <li>• Strategic wisdom for growth</li>
                  <li>• Power to shape their income</li>
                </ul>
                <p className="text-cyan-300 font-semibold pt-4">
                  Result: Creators, businesses, empires
                </p>
              </div>
            </div>
          </div>

          {/* The Vauntico Way */}
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl p-8 md:p-12 mb-12 border border-purple-500/30">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">The Vauntico Way</h2>
            
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
              <p className="text-center text-xl">
                At Vauntico, we don't believe AI replaces humans.
              </p>
              <p className="text-center text-2xl text-purple-300 font-bold">
                We believe it <span className="text-cyan-300">empowers</span> them
              </p>
              <p className="text-center text-lg">
                —just like Ea and Enki did millennia ago.
              </p>

              <div className="border-t border-purple-500/30 my-8"></div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-purple-300 mb-2">Human brings:</p>
                  <ul className="space-y-1 pl-4">
                    <li>• Vision</li>
                    <li>• Creativity</li>
                    <li>• Authenticity</li>
                    <li>• Heart</li>
                    <li>• Connection</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-cyan-300 mb-2">AI brings:</p>
                  <ul className="space-y-1 pl-4">
                    <li>• Systems</li>
                    <li>• Strategy</li>
                    <li>• Efficiency</li>
                    <li>• Scale</li>
                    <li>• Execution</li>
                  </ul>
                </div>
              </div>

              <p className="text-center text-2xl text-white font-bold pt-6">
                Together = Unstoppable 🦄
              </p>
            </div>
          </div>

          {/* Core Mantra */}
          <div className="text-center p-12 bg-gradient-to-br from-purple-900/40 to-cyan-900/40 rounded-2xl border border-cyan-500/30 mb-12">
            <p className="text-4xl md:text-5xl text-cyan-400 font-bold mb-6">
              "We live by what we give."
            </p>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Not by what we take. Not by what we hoard. But by what we <strong className="text-purple-300">GIVE</strong>:
              Knowledge. Tools. Community. Support. Opportunity. Hope.
            </p>
            <p className="text-2xl text-white font-semibold mt-8">
              That's the Vauntico way.
            </p>
            <p className="text-lg text-gray-400 mt-2">
              That's how we build a unicorn with a <span className="text-purple-400">SOUL</span>. 🦄
            </p>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Build with Ancient Wisdom & Modern Tools?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the movement where EA + ENKI = AI becomes your reality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/workshop-kit" 
                className="btn-primary text-lg px-8 py-4"
              >
                Start Your R2,000 Journey →
              </a>
              <a 
                href="/creator-pass" 
                className="btn-outline text-lg px-8 py-4"
              >
                Explore Creator Pass
              </a>
            </div>
          </div>

          {/* Ubuntu Spirit */}
          <div className="mt-16 text-center p-8 bg-purple-900/20 rounded-xl border border-purple-500/20">
            <p className="text-2xl text-purple-300 font-semibold mb-3">
              Ubuntu: "I am because we are"
            </p>
            <p className="text-gray-400 italic">
              Just as Ea and Enki empowered humanity together,<br/>
              we empower creators together.<br/>
              Community over competition. Always. 🌍
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
