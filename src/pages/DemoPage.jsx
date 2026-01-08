export default function DemoPage() {
  return (
    <div className="bg-black text-white min-h-screen px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-vauntico-gold">System UX</h1>
        <p className="mt-4 text-lg text-gray-300">
          Every page in Vauntico is designed to feel alive — clean, centered, and emotionally intelligent.
        </p>
      </header>

      <section className="bg-gray-900 p-6 rounded-lg mb-12">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">🎯 Funnel Showcase</h2>
        <p className="text-gray-300 mb-4">
          From homepage to vault unlock, every interaction is intentional. We optimize for clarity, emotion, and conversion.
        </p>
        <div className="bg-gray-800 p-4 rounded text-gray-400 text-sm">
          [Embed walkthrough video or animated funnel demo here]
        </div>
      </section>

      <section className="bg-gray-900 p-6 rounded-lg mb-12">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">🧠 Emotional Design</h2>
        <p className="text-gray-300 mb-4">
          We use color, spacing, and copy to guide users through transformation. Every vault feels sacred. Every CTA feels empowering.
        </p>
        <ul className="list-disc list-inside text-gray-400">
          <li>Gold accents for legacy and value</li>
          <li>Dark backgrounds for focus and depth</li>
          <li>Rounded corners for warmth and flow</li>
        </ul>
      </section>

      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">📐 UX Principles</h2>
        <p className="text-gray-300 mb-4">
          We follow a simple rule: clarity over complexity. Every page has one goal, one emotion, and one action.
        </p>
        <div className="bg-gray-800 p-4 rounded text-gray-400 text-sm">
          [Optional: Link to Figma file or UX doc]
        </div>
      </section>
    </div>
  );
}