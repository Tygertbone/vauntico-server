import { Link } from 'react-router-dom';

export default function OnboardingPage() {
  return (
    <div className="bg-black text-white min-h-screen px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-vauntico-gold">Launch with Precision</h1>
        <p className="mt-4 text-lg text-gray-300">
          Guided sprints. Execution clocks. Contributor onboarding. This is how creators move fast and build legacy.
        </p>
      </header>

      <section className="bg-gray-900 p-6 rounded-lg mb-12">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">🕒 Sprint Playbooks</h2>
        <p className="text-gray-300 mb-4">
          Each sprint is a 3-day guided launch cycle. You’ll get a checklist, a clock, and a contributor flow to stay aligned.
        </p>
        <Link to="/vault-success">
          <button className="bg-vauntico-gold text-black px-4 py-2 rounded hover:bg-yellow-400 transition">
            Start Your Sprint
          </button>
        </Link>
      </section>

      <section className="bg-gray-900 p-6 rounded-lg mb-12">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">👥 Contributor Onboarding</h2>
        <p className="text-gray-300 mb-4">
          Invite collaborators, assign vaults, and delegate tasks to AI agents. Everyone gets a role. Everyone builds.
        </p>
        <Link to="/delegation">
          <button className="bg-vauntico-gold text-black px-4 py-2 rounded hover:bg-yellow-400 transition">
            Delegate with AI
          </button>
        </Link>
      </section>

      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-vauntico-gold mb-4">📘 Sprint Templates</h2>
        <p className="text-gray-300 mb-4">
          Downloadable Notion playbooks, Airtable trackers, and branded sprint kits. Everything you need to launch.
        </p>
        <a
          href="https://notion.so/your-sprint-template-link"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-vauntico-gold text-black px-4 py-2 rounded hover:bg-yellow-400 transition"
        >
          View Sprint Template
        </a>
      </section>
    </div>
  );
}