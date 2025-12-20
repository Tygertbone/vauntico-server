import { useState } from 'react'

const roles = [
  {
    id: 'solo-creator',
    icon: '👨‍💻',
    title: 'Solo Creator',
    subtitle: 'Building Your Empire',
    description: 'You\'re a creator, founder, or solopreneur building your vision. You need proven frameworks and efficient workflows.',
    path: 'Start with the Creator Pass scroll, then explore core features.',
    scrollAccess: ['00-index', 'creator-pass', 'ASCENSION_SCROLL'],
    color: 'from-purple-500 to-blue-500'
  },
  {
    id: 'agency',
    icon: '🏢',
    title: 'Agency Partner',
    subtitle: 'Scale Your Services',
    description: 'You run an agency and want to resell, white-label, or integrate Vauntico into your offerings.',
    path: 'Start with the Agency Scroll, then dive into CLI tools.',
    scrollAccess: ['00-index', '10-agency-scroll', 'AGENCY_CLI_QUICKSTART', 'creator-pass'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'team-lead',
    icon: '👥',
    title: 'Team Lead',
    subtitle: 'Organize Your Squad',
    description: 'You manage a team of creators and need collaborative tools, workflow automation, and scalable systems.',
    path: 'Start with the Index, then explore team features.',
    scrollAccess: ['00-index', 'creator-pass', 'AGENCY_CLI_QUICKSTART'],
    color: 'from-cyan-500 to-teal-500'
  }
]

function RoleSelector({ onSelectRole }) {
  const [hoveredRole, setHoveredRole] = useState(null)

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">
          Choose Your <span className="text-gradient">Path</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your role determines which scrolls you'll access first. Don't worry—you can always explore other paths later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => onSelectRole(role)}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
            className="card cursor-pointer border-2 border-transparent hover:border-vault-purple transition-all transform hover:scale-105 hover:shadow-2xl"
          >
            {/* Icon & Title */}
            <div className="text-center mb-4">
              <div className="text-6xl mb-3 transform transition-transform duration-300 hover:scale-110">
                {role.icon}
              </div>
              <h3 className="text-2xl font-bold mb-1">{role.title}</h3>
              <p className="text-sm text-gray-500 font-medium">{role.subtitle}</p>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {role.description}
            </p>

            {/* Path Indicator */}
            <div className="border-t pt-4 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">YOUR PATH:</p>
              <p className="text-xs text-gray-600 italic">{role.path}</p>
            </div>

            {/* Scroll Count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {role.scrollAccess.length} scrolls unlocked
              </span>
              <span className={`bg-gradient-to-r ${role.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                Begin →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Vault Access Info */}
      <div className="mt-12 card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">💎</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Unlock All Scrolls with Creator Pass</h3>
            <p className="text-gray-600 text-sm mb-4">
              Some advanced scrolls require Creator Pass. Upgrade anytime to access the full library, 
              including agency tools, CLI quickstarts, and exclusive implementation guides.
            </p>
            <a href="/creator-pass" className="btn-primary inline-block text-sm">
              Explore Creator Pass →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelector
