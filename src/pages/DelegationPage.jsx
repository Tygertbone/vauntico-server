export default function DelegationPage() {
  return (
    <div className="bg-black text-white min-h-screen px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-vauntico-gold">AI Collaboration</h1>
        <p className="mt-4 text-lg text-gray-300">
          Work with AI agents like teammates. Delegate tasks, orchestrate workflows, and scale your impact.
        </p>
      </header>

      <section className="bg-gray-900 p-6 rounded-lg mb-12">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">🤖 Delegate with Precision</h2>
        <p className="text-gray-300 mb-4">
          Assign tasks to AI agents for transcription, research, prompt generation, and automation. Treat them like specialists.
        </p>
        <ul className="list-disc list-inside text-gray-400">
          <li>Transcribe audio or video content</li>
          <li>Generate branded prompts and copy</li>
          <li>Research competitors or trends</li>
          <li>Automate repetitive workflows</li>
        </ul>
      </section>

      <section className="bg-gray-900 p-6 rounded-lg mb-12">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">📂 Agent Templates</h2>
        <p className="text-gray-300 mb-4">
          Use pre-built templates to assign tasks to agents like Cursur, GitHub Copilot, or your own AI stack.
        </p>
        <div className="bg-gray-800 p-4 rounded text-gray-400 text-sm">
          [Embed or link to delegation templates here]
        </div>
      </section>

      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">🧠 Orchestrate Like a Founder</h2>
        <p className="text-gray-300 mb-4">
          You’re not just using AI — you’re leading it. Assign roles, set goals, and build a system that scales with you.
        </p>
        <a
          href="https://notion.so/your-delegation-guide-link"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-vauntico-gold text-black px-4 py-2 rounded hover:bg-yellow-400 transition"
        >
          View Delegation Guide
        </a>
      </section>
    </div>
  );
}