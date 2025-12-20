import { useState } from 'react'

// Command templates based on scroll context
const COMMAND_TEMPLATES = {
  'audit-as-a-service': {
    category: 'Audit',
    icon: '📊',
    commands: [
      {
        id: 'basic-audit',
        name: 'Run Basic Site Audit',
        template: 'vauntico audit run --url {{URL}} --pillars seo,conversion',
        inputs: [
          { key: 'URL', label: 'Website URL', placeholder: 'https://example.com', required: true }
        ],
        description: 'Quick audit focusing on SEO and conversion optimization'
      },
      {
        id: 'full-audit',
        name: 'Comprehensive Audit',
        template: 'vauntico audit run --url {{URL}} --pillars all --format pdf --output {{OUTPUT}}',
        inputs: [
          { key: 'URL', label: 'Website URL', placeholder: 'https://example.com', required: true },
          { key: 'OUTPUT', label: 'Output Path', placeholder: './reports/audit.pdf', required: false }
        ],
        description: 'Full audit across all pillars with PDF report'
      },
      {
        id: 'scheduled-audit',
        name: 'Schedule Recurring Audit',
        template: 'vauntico audit schedule --url {{URL}} --frequency {{FREQUENCY}} --notify true',
        inputs: [
          { key: 'URL', label: 'Website URL', placeholder: 'https://example.com', required: true },
          { key: 'FREQUENCY', label: 'Frequency', type: 'select', options: ['weekly', 'monthly', 'quarterly'], required: true }
        ],
        description: 'Automate regular site audits'
      }
    ]
  },
  'dream-mover-cli': {
    category: 'Content Generation',
    icon: '🎨',
    commands: [
      {
        id: 'gen-blog',
        name: 'Generate Blog Post',
        template: 'vauntico generate text --prompt "{{PROMPT}}" --style blog --length {{LENGTH}}',
        inputs: [
          { key: 'PROMPT', label: 'Content Topic', placeholder: '10 tips for productivity', required: true },
          { key: 'LENGTH', label: 'Word Count', type: 'select', options: ['500', '1000', '1500', '2000'], required: true }
        ],
        description: 'AI-powered blog post generation'
      },
      {
        id: 'gen-image',
        name: 'Generate Image',
        template: 'vauntico generate image --prompt "{{PROMPT}}" --size {{SIZE}} --style {{STYLE}}',
        inputs: [
          { key: 'PROMPT', label: 'Image Description', placeholder: 'cyberpunk city at sunset', required: true },
          { key: 'SIZE', label: 'Dimensions', type: 'select', options: ['512x512', '1024x1024', '1920x1080'], required: true },
          { key: 'STYLE', label: 'Art Style', type: 'select', options: ['photorealistic', 'artistic', 'cartoon', 'abstract'], required: false }
        ],
        description: 'Generate images from text descriptions'
      },
      {
        id: 'save-template',
        name: 'Save Content Template',
        template: 'vauntico template save --name "{{NAME}}" --prompt "{{PROMPT}}" --style {{STYLE}}',
        inputs: [
          { key: 'NAME', label: 'Template Name', placeholder: 'weekly-newsletter', required: true },
          { key: 'PROMPT', label: 'Template Prompt', placeholder: 'Weekly newsletter about...', required: true },
          { key: 'STYLE', label: 'Writing Style', type: 'select', options: ['professional', 'casual', 'technical', 'creative'], required: true }
        ],
        description: 'Create reusable generation templates'
      }
    ]
  },
  'AGENCY_CLI_QUICKSTART': {
    category: 'Agency Operations',
    icon: '🏢',
    commands: [
      {
        id: 'onboard-client',
        name: 'Onboard New Client',
        template: 'vauntico agency onboard --client "{{CLIENT}}" --modules {{MODULES}} --white-label {{WHITE_LABEL}}',
        inputs: [
          { key: 'CLIENT', label: 'Client Domain', placeholder: 'acme-corp.com', required: true },
          { key: 'MODULES', label: 'Enabled Modules', placeholder: 'audit,workshop,distribution', required: true },
          { key: 'WHITE_LABEL', label: 'White Label', type: 'select', options: ['true', 'false'], required: true }
        ],
        description: 'Add a new client to your agency account'
      },
      {
        id: 'client-audit',
        name: 'Run Client Audit',
        template: 'vauntico audit run --url https://{{CLIENT}} --pillars all --brand "{{AGENCY}}" --output ./reports/{{CLIENT}}-audit.pdf',
        inputs: [
          { key: 'CLIENT', label: 'Client Domain', placeholder: 'client-site.com', required: true },
          { key: 'AGENCY', label: 'Your Agency Name', placeholder: 'Your Agency', required: true }
        ],
        description: 'Generate branded audit for client'
      },
      {
        id: 'batch-audits',
        name: 'Audit All Clients',
        template: 'vauntico agency audit-all --frequency {{FREQUENCY}} --notify-clients true',
        inputs: [
          { key: 'FREQUENCY', label: 'Frequency', type: 'select', options: ['weekly', 'monthly', 'quarterly'], required: true }
        ],
        description: 'Run audits for all your clients'
      },
      {
        id: 'configure-branding',
        name: 'Setup Custom Branding',
        template: 'vauntico brand configure --name "{{AGENCY}}" --logo {{LOGO_PATH}} --colors {{COLORS_PATH}}',
        inputs: [
          { key: 'AGENCY', label: 'Agency Name', placeholder: 'Your Agency', required: true },
          { key: 'LOGO_PATH', label: 'Logo Path', placeholder: './assets/logo.png', required: true },
          { key: 'COLORS_PATH', label: 'Colors Config', placeholder: './assets/colors.json', required: false }
        ],
        description: 'Apply your branding to all outputs'
      }
    ]
  },
  '10-agency-scroll': {
    category: 'Agency Tools',
    icon: '🔧',
    commands: [
      {
        id: 'revenue-report',
        name: 'Generate Revenue Report',
        template: 'vauntico agency revenue --period "{{PERIOD}}" --format {{FORMAT}} --breakdown by-client',
        inputs: [
          { key: 'PERIOD', label: 'Time Period', placeholder: '2025-Q1', required: true },
          { key: 'FORMAT', label: 'Output Format', type: 'select', options: ['csv', 'pdf', 'json'], required: true }
        ],
        description: 'Financial analytics and reporting'
      },
      {
        id: 'client-report',
        name: 'Email Client Report',
        template: 'vauntico agency report --client "{{CLIENT}}" --period "{{PERIOD}}" --email-to {{EMAIL}}',
        inputs: [
          { key: 'CLIENT', label: 'Client Name', placeholder: 'acme-corp', required: true },
          { key: 'PERIOD', label: 'Report Period', placeholder: 'january-2025', required: true },
          { key: 'EMAIL', label: 'Client Email', placeholder: 'client@example.com', required: true }
        ],
        description: 'Send automated client report'
      }
    ]
  },
  'creator-pass': {
    category: 'Account Management',
    icon: '👑',
    commands: [
      {
        id: 'check-status',
        name: 'Check Creator Pass Status',
        template: 'vauntico account info',
        inputs: [],
        description: 'View your subscription and usage'
      },
      {
        id: 'usage-stats',
        name: 'View Usage Statistics',
        template: 'vauntico credits usage --period {{PERIOD}}',
        inputs: [
          { key: 'PERIOD', label: 'Time Period', type: 'select', options: ['this-month', 'last-month', 'this-quarter', 'this-year'], required: true }
        ],
        description: 'Track your generation credits'
      }
    ]
  }
}

function CLICommandGenerator({ scrollId, onClose }) {
  const [selectedCommand, setSelectedCommand] = useState(null)
  const [inputValues, setInputValues] = useState({})
  const [generatedCommand, setGeneratedCommand] = useState('')
  const [copiedCommand, setCopiedCommand] = useState(false)

  const commandSet = COMMAND_TEMPLATES[scrollId] || {
    category: 'General',
    icon: '⚡',
    commands: []
  }

  const handleSelectCommand = (command) => {
    setSelectedCommand(command)
    setInputValues({})
    setGeneratedCommand('')
  }

  const handleInputChange = (key, value) => {
    setInputValues(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerate = () => {
    if (!selectedCommand) return

    let command = selectedCommand.template
    
    // Replace all placeholders with input values
    Object.entries(inputValues).forEach(([key, value]) => {
      command = command.replace(new RegExp(`{{${key}}}`, 'g'), value || '')
    })

    // Clean up any remaining unfilled placeholders
    command = command.replace(/{{[A-Z_]+}}/g, '')
    
    setGeneratedCommand(command)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCommand)
    setCopiedCommand(true)
    setTimeout(() => setCopiedCommand(false), 2000)
  }

  const canGenerate = () => {
    if (!selectedCommand) return false
    const requiredInputs = selectedCommand.inputs.filter(i => i.required)
    return requiredInputs.every(input => inputValues[input.key]?.trim())
  }

  return (
    <div className="card mb-8 border-2 border-vault-purple/20">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{commandSet.icon}</div>
          <div>
            <h3 className="text-xl font-bold">CLI Command Generator</h3>
            <p className="text-sm text-gray-600">{commandSet.category}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        )}
      </div>

      {commandSet.commands.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">🔧</div>
          <p>No command templates available for this scroll yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Command Selection */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-700">Select Command Template</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {commandSet.commands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelectCommand(cmd)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedCommand?.id === cmd.id
                      ? 'border-vault-purple bg-vault-purple/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold mb-1">{cmd.name}</div>
                  <p className="text-sm text-gray-600">{cmd.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Command Builder */}
          <div>
            {selectedCommand ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Configure Command</h4>
                
                {/* Input Fields */}
                {selectedCommand.inputs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCommand.inputs.map((input) => (
                      <div key={input.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {input.label}
                          {input.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {input.type === 'select' ? (
                          <select
                            value={inputValues[input.key] || ''}
                            onChange={(e) => handleInputChange(input.key, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vault-purple focus:border-transparent"
                          >
                            <option value="">-- Select --</option>
                            {input.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={inputValues[input.key] || ''}
                            onChange={(e) => handleInputChange(input.key, e.target.value)}
                            placeholder={input.placeholder}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vault-purple focus:border-transparent"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    ℹ️ This command requires no configuration
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate() && selectedCommand.inputs.length > 0}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    canGenerate() || selectedCommand.inputs.length === 0
                      ? 'bg-vault-purple text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ⚡ Generate Command
                </button>

                {/* Generated Command Output */}
                {generatedCommand && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-700">Your Command</h5>
                      <button
                        onClick={handleCopy}
                        className="text-sm text-vault-purple hover:text-vault-purple/80 font-medium flex items-center space-x-1"
                      >
                        {copiedCommand ? (
                          <>
                            <span>✓</span>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <span>📋</span>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <code>$ {generatedCommand}</code>
                    </div>
                    
                    <div className="mt-4 bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm">
                      ✓ Ready to paste into your terminal
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-5xl mb-3">👈</div>
                  <p className="text-sm">Select a command template to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Save frequently used commands as shell aliases</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use <code className="bg-gray-100 px-2 py-0.5 rounded">vauntico --help</code> for full command reference</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Combine commands with shell pipes for advanced workflows</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CLICommandGenerator
