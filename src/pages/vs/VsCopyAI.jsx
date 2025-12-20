import ComparisonPageTemplate from '../../components/ComparisonPageTemplate'

/**
 * Vauntico vs Copy.ai Comparison Page
 * 
 * Angle: "Beyond Generic Marketing Copy"
 * Focus: Voice learning, infrastructure, not just copy
 */
function VsCopyAI() {
  const comparisonData = {
    competitorName: 'Copy.ai',
    heroTitle: 'Vauntico vs Copy.ai: Beyond Generic Marketing Copy',
    heroSubtitle: 'Stop generating cookie-cutter copy. Start building complete infrastructure with AI that learns your unique voice.',
    
    comparisonFeatures: [
      {
        name: 'Deep Voice Learning',
        competitor: { icon: '⚠️', color: 'text-yellow-500', note: 'Basic tone only' },
        vauntico: { icon: '✅', color: 'text-green-500', note: 'Learns frameworks' }
      },
      {
        name: 'Infrastructure Generation',
        competitor: { icon: '❌', color: 'text-red-500', note: 'Copy snippets only' },
        vauntico: { icon: '✅', color: 'text-green-500', note: 'Complete systems' }
      },
      {
        name: 'CLI Workflow',
        competitor: { icon: '❌', color: 'text-red-500' },
        vauntico: { icon: '✅', color: 'text-green-500', note: 'Command-line power' }
      },
      {
        name: 'Organization System',
        competitor: { icon: '❌', color: 'text-red-500' },
        vauntico: { icon: '✅', color: 'text-green-500', note: 'Intelligent Vaults' }
      },
      {
        name: 'Monthly Cost',
        competitor: { icon: '💸', color: 'text-red-500', note: '$36-$186/mo' },
        vauntico: { icon: '💰', color: 'text-green-500', note: '$29/mo total' }
      }
    ],

    strengths: {
      points: [
        {
          title: 'Marketing Copy Templates',
          description: 'Copy.ai has 90+ templates specifically for marketing—ad copy, product descriptions, email sequences, and social posts.'
        },
        {
          title: 'Quick Copy Generation',
          description: 'If you need a Facebook ad headline or product description right now, Copy.ai can generate multiple variations in seconds.'
        },
        {
          title: 'Tone Selector',
          description: 'Choose from preset tones (professional, casual, enthusiastic) to match your brand voice (though it\'s surface-level).'
        },
        {
          title: 'Integrations',
          description: 'Copy.ai integrates with tools like Zapier, making it easy to connect to your existing marketing stack.'
        }
      ]
    },

    weaknesses: {
      points: [
        {
          title: 'Generic, Template-Based Output',
          description: 'Copy.ai generates marketing copy that sounds like everyone else. It\'s optimized for "conversion" but lacks unique voice, positioning, and insight.'
        },
        {
          title: 'Surface-Level Tone Matching',
          description: 'Selecting "enthusiastic" or "professional" doesn\'t capture your actual voice. Copy.ai can\'t learn your frameworks, positioning, or unique insights—just surface-level tone.'
        },
        {
          title: 'No Infrastructure Generation',
          description: 'Copy.ai gives you isolated snippets—headlines, descriptions, emails. You still need design tools, landing page builders, and organization systems. It\'s just one piece of the puzzle.'
        },
        {
          title: 'Expensive at Scale',
          description: 'Pro plan is $36/mo (5 seats). Team plan jumps to $186/mo. For what you get (basic marketing copy), it\'s overpriced compared to full Creator OS alternatives.'
        },
        {
          title: 'No Organization Layer',
          description: 'Copy.ai has no system for organizing generated content. You\'re copy/pasting into Notion, Google Docs, or other tools. It\'s a bridge to nowhere.'
        }
      ]
    },

    howVaunticoDifferent: {
      points: [
        {
          title: 'Deep Voice Learning (Not Just Tone Matching)',
          description: 'Copy.ai selects tone presets. Vauntico learns your actual voice—your frameworks, positioning, unique insights. The more you use it, the more it sounds like you (not like everyone else).'
        },
        {
          title: 'Infrastructure, Not Just Copy Snippets',
          description: 'Copy.ai generates headlines and product descriptions. Vauntico generates complete landing pages, workshop curricula, audit frameworks. It builds systems, not isolated snippets.'
        },
        {
          title: 'CLI Workflow for Power Users',
          description: 'Copy.ai is template-based point-and-click. Vauntico is CLI-first: one command generates complete infrastructure. It\'s built for creators who ship, not marketers who need quick ad copy.'
        },
        {
          title: 'Intelligent Vaults for Organization',
          description: 'Unlike Copy.ai\'s "generate and forget" approach, Vauntico stores everything in organized Vaults with full context retention. Your work is persistent, searchable, and exportable.'
        }
      ]
    },

    whoShouldChoose: {
      competitor: {
        icon: '📝',
        points: [
          'You only need marketing copy snippets (ad headlines, product descriptions)',
          'Your workflow is built around template-based generation',
          'You don\'t mind sounding like everyone else (generic conversion copy)',
          'You have other tools for organization and infrastructure'
        ]
      },
      vauntico: {
        icon: '⚡',
        points: [
          'You want AI that learns your unique voice and frameworks (not just tone)',
          'You need complete infrastructure generation, not just copy snippets',
          'You\'re tired of juggling Copy.ai + design tools + organization systems',
          'You want CLI speed and power instead of template clicking',
          'You want to save money ($29 for everything vs. $36-186 for just copy)'
        ]
      }
    },

    faqs: [
      {
        question: 'Can I use both Copy.ai and Vauntico together?',
        answer: 'You could, but it\'s redundant. Vauntico does everything Copy.ai does (AI copy generation) PLUS infrastructure generation, organization, and CLI workflow. Most creators replace Copy.ai entirely to save $36-186/mo.'
      },
      {
        question: 'How does pricing compare?',
        answer: 'Copy.ai Pro is $36/mo (5 seats, basic copy). Team plan is $186/mo. Vauntico is $29/mo for a complete Creator OS (AI generation + organization + infrastructure + CLI). You save money and get exponentially more capability.'
      },
      {
        question: 'Is migration from Copy.ai easy?',
        answer: 'Yes! Export your Copy.ai generated content and import it into Vauntico Vaults. Our CLI can help you reorganize it intelligently. Most creators migrate in under 20 minutes.'
      },
      {
        question: 'Does Vauntico have marketing copy templates like Copy.ai?',
        answer: 'No—and that\'s better. Templates produce generic copy. Vauntico uses CLI commands where you speak your vision and it generates infrastructure that sounds uniquely like you. Far more powerful than template-based copy generation.'
      }
    ],

    seo: {
      title: 'Vauntico vs Copy.ai 2025: Beyond Generic Marketing Copy | Creator OS',
      description: 'Tired of Copy.ai\'s generic templates? Vauntico learns your unique voice and generates complete infrastructure. Save $157/mo and ship 10x faster. Try free.'
    }
  }

  return <ComparisonPageTemplate {...comparisonData} />
}

export default VsCopyAI
