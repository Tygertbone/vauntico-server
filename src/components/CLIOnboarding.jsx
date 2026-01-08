import { useState, useEffect } from 'react'

const ONBOARDING_STEPS = {
  'solo-creator': [
    {
      id: 'install',
      title: 'Install Dream Mover CLI',
      description: 'Get the command-line tools on your machine',
      icon: '⚡',
      command: 'npm install -g @vauntico/cli',
      altCommand: 'yarn global add @vauntico/cli',
      verifyCommand: 'vauntico --version',
      expectedOutput: 'vauntico v2.0.0',
      scrollReference: 'dream-mover-cli',
      optional: false
    },
    {
      id: 'auth',
      title: 'Authenticate Your Account',
      description: 'Link your Vauntico account to the CLI',
      icon: '🔐',
      command: 'vauntico auth login',
      expectedOutput: '✓ Authentication successful',
      scrollReference: 'creator-pass',
      optional: false
    },
    {
      id: 'profile',
      title: 'Set Your Creator Profile',
      description: 'Configure your default generation settings',
      icon: '👤',
      command: 'vauntico config set mode creator',
      additionalCommands: [
        'vauntico config set style professional',
        'vauntico config set output-format markdown'
      ],
      expectedOutput: '✓ Profile configured',
      scrollReference: 'creator-pass',
      optional: false
    },
    {
      id: 'first-gen',
      title: 'Generate Your First Content',
      description: 'Test the power of Dream Mover',
      icon: '🎨',
      command: 'vauntico generate text --prompt "Welcome post for my audience" --style blog',
      expectedOutput: '✓ Generated 450 words',
      scrollReference: 'dream-mover-cli',
      optional: false
    },
    {
      id: 'templates',
      title: 'Setup Content Templates',
      description: 'Create reusable generation templates',
      icon: '📋',
      command: 'vauntico template save --name "weekly-newsletter" --config template.json',
      scrollReference: 'dream-mover-cli',
      optional: true
    }
  ],
  'agency': [
    {
      id: 'install',
      title: 'Install Vauntico Agency CLI',
      description: 'Get the full agency toolkit',
      icon: '🏢',
      command: 'npm install -g @vauntico/cli',
      altCommand: 'yarn global add @vauntico/cli',
      verifyCommand: 'vauntico --version',
      expectedOutput: 'vauntico v2.0.0',
      scrollReference: 'AGENCY_CLI_QUICKSTART',
      optional: false
    },
    {
      id: 'auth',
      title: 'Authenticate Agency Account',
      description: 'Login with your agency credentials',
      icon: '🔐',
      command: 'vauntico auth login',
      expectedOutput: '✓ Agency account authenticated',
      scrollReference: 'AGENCY_CLI_QUICKSTART',
      optional: false
    },
    {
      id: 'agency-mode',
      title: 'Enable Agency Mode',
      description: 'Unlock white-label and client management features',
      icon: '⚙️',
      command: 'vauntico config set mode agency',
      additionalCommands: [
        'vauntico config set white-label true',
        'vauntico agency verify'
      ],
      expectedOutput: '✓ Agency mode activated',
      scrollReference: '10-agency-scroll',
      optional: false
    },
    {
      id: 'onboard-client',
      title: 'Onboard Your First Client',
      description: 'Add a client to your agency dashboard',
      icon: '🤝',
      command: 'vauntico agency onboard --client "acme-corp" --modules "audit,workshop"',
      expectedOutput: '✓ Client onboarded',
      scrollReference: 'AGENCY_CLI_QUICKSTART',
      optional: false
    },
    {
      id: 'run-audit',
      title: 'Run Your First Audit',
      description: 'Generate a branded audit report',
      icon: '📊',
      command: 'vauntico audit run --url https://client-site.com --pillars all --white-label true',
      expectedOutput: '✓ Audit complete - report generated',
      scrollReference: 'AGENCY_CLI_QUICKSTART',
      optional: false
    },
    {
      id: 'branding',
      title: 'Setup Custom Branding',
      description: 'Apply your agency branding to all outputs',
      icon: '🎨',
      command: 'vauntico brand configure --name "Your Agency" --logo ./logo.png --colors ./colors.json',
      scrollReference: 'AGENCY_CLI_QUICKSTART',
      optional: true
    },
    {
      id: 'automation',
      title: 'Enable Automation',
      description: 'Schedule recurring audits and reports',
      icon: '🤖',
      command: 'vauntico audit schedule --url https://client-site.com --frequency monthly',
      scrollReference: 'AGENCY_CLI_QUICKSTART',
      optional: true
    }
  ],
  'team-lead': [
    {
      id: 'install',
      title: 'Install Team CLI',
      description: 'Get collaborative tools for your squad',
      icon: '👥',
      command: 'npm install -g @vauntico/cli',
      verifyCommand: 'vauntico --version',
      expectedOutput: 'vauntico v2.0.0',
      scrollReference: 'dream-mover-cli',
      optional: false
    },
    {
      id: 'auth',
      title: 'Authenticate Team Lead',
      description: 'Login with team lead permissions',
      icon: '🔐',
      command: 'vauntico auth login',
      expectedOutput: '✓ Team lead authenticated',
      scrollReference: 'creator-pass',
      optional: false
    },
    {
      id: 'team-setup',
      title: 'Create Your Team',
      description: 'Setup team workspace and invite members',
      icon: '🏗️',
      command: 'vauntico team create --name "Your Squad" --seats 5',
      additionalCommands: [
        'vauntico team invite --email teammate@example.com'
      ],
      expectedOutput: '✓ Team created',
      scrollReference: 'creator-pass',
      optional: false
    },
    {
      id: 'shared-templates',
      title: 'Setup Shared Templates',
      description: 'Create team-wide content templates',
      icon: '📚',
      command: 'vauntico template create --name "team-blog-post" --shared true',
      scrollReference: 'dream-mover-cli',
      optional: false
    }
  ]
}

function CLIOnboarding({ role, onComplete, onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [skippedSteps, setSkippedSteps] = useState(new Set())
  const [copiedCommand, setCopiedCommand] = useState(null)

  const steps = ONBOARDING_STEPS[role.id] || []
  const currentStep = steps[currentStepIndex]
  const progress = ((completedSteps.size + skippedSteps.size) / steps.length) * 100

  useEffect(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem(`vauntico_cli_onboarding_${role.id}`)
    if (saved) {
      const { completed, skipped } = JSON.parse(saved)
      setCompletedSteps(new Set(completed))
      setSkippedSteps(new Set(skipped))
    }
  }, [role.id])

  const saveProgress = (completed, skipped) => {
    localStorage.setItem(
      `vauntico_cli_onboarding_${role.id}`,
      JSON.stringify({
        completed: Array.from(completed),
        skipped: Array.from(skipped)
      })
    )
  }

  const handleCopyCommand = (command) => {
    navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const handleComplete = () => {
    const newCompleted = new Set(completedSteps)
    newCompleted.add(currentStep.id)
    setCompletedSteps(newCompleted)
    saveProgress(newCompleted, skippedSteps)

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      onComplete?.()
    }
  }

  const handleSkip = () => {
    if (currentStep.optional) {
      const newSkipped = new Set(skippedSteps)
      newSkipped.add(currentStep.id)
      setSkippedSteps(newSkipped)
      saveProgress(completedSteps, newSkipped)

      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1)
      } else {
        onComplete?.()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleJumpToStep = (index) => {
    setCurrentStepIndex(index)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-vault-purple to-vault-blue text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">{role.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">CLI Onboarding</h2>
                <p className="text-blue-100 text-sm">{role.title} Path</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-100">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Step Navigation */}
          <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleJumpToStep(index)}
                disabled={index > currentStepIndex && !completedSteps.has(steps[index - 1]?.id)}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  completedSteps.has(step.id)
                    ? 'bg-green-500 text-white'
                    : skippedSteps.has(step.id)
                    ? 'bg-gray-300 text-gray-600'
                    : index === currentStepIndex
                    ? 'bg-vault-purple text-white ring-4 ring-purple-200'
                    : 'bg-gray-200 text-gray-500'
                } ${index <= currentStepIndex ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'}`}
              >
                {completedSteps.has(step.id) ? '✓' : index + 1}
              </button>
            ))}
          </div>

          {/* Current Step */}
          {currentStep && (
            <div>
              {/* Step Header */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-6xl">{currentStep.icon}</div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-2">{currentStep.title}</h3>
                  <p className="text-gray-600 text-lg">{currentStep.description}</p>
                  {currentStep.optional && (
                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                      Optional
                    </span>
                  )}
                </div>
              </div>

              {/* Command Block */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">Primary Command</h4>
                  <button
                    onClick={() => handleCopyCommand(currentStep.command)}
                    className="text-sm text-vault-purple hover:text-vault-purple/80 font-medium flex items-center space-x-1"
                  >
                    {copiedCommand === currentStep.command ? (
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
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <code>$ {currentStep.command}</code>
                </div>
              </div>

              {/* Alternative Command */}
              {currentStep.altCommand && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Alternative</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <code>$ {currentStep.altCommand}</code>
                  </div>
                </div>
              )}

              {/* Additional Commands */}
              {currentStep.additionalCommands && currentStep.additionalCommands.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Additional Setup</h4>
                  <div className="space-y-2">
                    {currentStep.additionalCommands.map((cmd, idx) => (
                      <div key={idx} className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                        <code>$ {cmd}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verify Command */}
              {currentStep.verifyCommand && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Verify Installation</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <code>$ {currentStep.verifyCommand}</code>
                  </div>
                </div>
              )}

              {/* Expected Output */}
              {currentStep.expectedOutput && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Expected Result</h4>
                  <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm">
                    {currentStep.expectedOutput}
                  </div>
                </div>
              )}

              {/* Scroll Reference */}
              {currentStep.scrollReference && (
                <div className="card bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">📜</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">Related Scroll</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Learn more about this step in the <strong>{currentStep.scrollReference}</strong> scroll.
                      </p>
                      <a
                        href={`/lore?scroll=${currentStep.scrollReference}`}
                        className="text-sm text-vault-purple hover:text-vault-purple/80 font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Scroll in New Tab →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStepIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Previous
          </button>

          <div className="flex items-center space-x-3">
            {currentStep?.optional && (
              <button
                onClick={handleSkip}
                className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Skip Step
              </button>
            )}
            
            <button
              onClick={handleComplete}
              className="px-8 py-3 rounded-lg font-medium bg-gradient-to-r from-vault-purple to-vault-blue text-white hover:shadow-lg transition-all"
            >
              {currentStepIndex === steps.length - 1 ? (
                '🎉 Complete Onboarding'
              ) : (
                completedSteps.has(currentStep?.id) ? 'Next Step →' : 'Mark Complete & Continue →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CLIOnboarding
