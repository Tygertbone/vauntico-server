# 🚀 CLI Onboarding System - Developer Guide

**Version:** 1.0  
**Status:** Production Ready  
**Phase:** 3 - Soul Surfacing

---

## 📖 Overview

The CLI Onboarding Rituals system transforms Vauntico's command-line tools from intimidating to intuitive through interactive, role-based guidance. It bridges the gap between documentation (scrolls) and action (CLI commands).

---

## 🏗️ Architecture

### Component Structure

```
/src/components/
├── CLIOnboarding.jsx           # Main onboarding modal (421 lines)
├── CLICommandGenerator.jsx     # Dynamic command builder (365 lines)
└── OnboardingProgress.jsx      # Progress tracker + mini widget (254 lines)
```

### Data Flow

```
User Action → Component State → LocalStorage
                    ↓
        Achievement System (global)
                    ↓
         UI Updates (progress, badges)
```

---

## 🎯 Core Components

### 1. CLIOnboarding

**Purpose:** Interactive modal for step-by-step CLI setup

**Props:**

- `role` (object): Selected role from RoleSelector
- `onComplete` (function): Callback when onboarding finishes
- `onClose` (function): Callback to close modal

**Usage:**

```jsx
import CLIOnboarding from "./components/CLIOnboarding";

<CLIOnboarding
  role={selectedRole}
  onComplete={() => {
    console.log("Onboarding complete!");
    setShowOnboarding(false);
  }}
  onClose={() => setShowOnboarding(false)}
/>;
```

**Step Configuration:**

```javascript
{
  id: 'install',
  title: 'Install Dream Mover CLI',
  description: 'Get the command-line tools on your machine',
  icon: '⚡',
  command: 'npm install -g @vauntico/cli',
  altCommand: 'yarn global add @vauntico/cli', // Optional
  verifyCommand: 'vauntico --version', // Optional
  expectedOutput: 'vauntico v2.0.0', // Optional
  scrollReference: 'dream-mover-cli', // Optional
  optional: false
}
```

---

### 2. CLICommandGenerator

**Purpose:** Generate custom CLI commands from templates

**Props:**

- `scrollId` (string): ID of current scroll (determines templates)
- `onClose` (function): Optional close callback

**Usage:**

```jsx
import CLICommandGenerator from "./components/CLICommandGenerator";

<CLICommandGenerator
  scrollId="AGENCY_CLI_QUICKSTART"
  onClose={() => setShowGenerator(false)}
/>;
```

**Adding New Command Templates:**

Edit `src/components/CLICommandGenerator.jsx`:

```javascript
const COMMAND_TEMPLATES = {
  "your-scroll-id": {
    category: "Your Category",
    icon: "🔧",
    commands: [
      {
        id: "unique-command-id",
        name: "User-Friendly Name",
        template: "vauntico command --flag {{PLACEHOLDER}}",
        inputs: [
          {
            key: "PLACEHOLDER",
            label: "Field Label",
            placeholder: "example value",
            required: true,
          },
        ],
        description: "What this command does",
      },
    ],
  },
};
```

---

### 3. OnboardingProgress

**Purpose:** Display onboarding progress with achievements

**Main Component Props:**

- `roleId` (string): Current user's role
- `onStartOnboarding` (function): Callback to launch onboarding

**Mini Component Props:**

- `roleId` (string): Current user's role
- `onStartOnboarding` (function): Callback to launch onboarding

**Usage:**

```jsx
import OnboardingProgress, { OnboardingProgressMini } from './components/OnboardingProgress'

// Full card
<OnboardingProgress
  roleId="solo-creator"
  onStartOnboarding={() => setShowOnboarding(true)}
/>

// Mini widget (for sidebar/header)
<OnboardingProgressMini
  roleId="solo-creator"
  onStartOnboarding={() => setShowOnboarding(true)}
/>
```

---

## 💾 Data Persistence

### LocalStorage Keys:

- `vauntico_cli_onboarding_{roleId}`: Per-role progress
- `vauntico_achievements`: Global achievement list

### Data Structures:

**Onboarding Progress:**

```json
{
  "completed": ["install", "auth", "profile"],
  "skipped": ["templates"]
}
```

**Achievements:**

```json
["first-install", "first-auth", "onboarding-complete"]
```

### Helper Functions:

```javascript
// Save progress
localStorage.setItem(
  `vauntico_cli_onboarding_${role.id}`,
  JSON.stringify({ completed, skipped }),
);

// Load progress
const saved = localStorage.getItem(`vauntico_cli_onboarding_${role.id}`);
const { completed, skipped } = JSON.parse(saved);

// Award achievement
const achievements = JSON.parse(
  localStorage.getItem("vauntico_achievements") || "[]",
);
achievements.push("new-achievement-id");
localStorage.setItem("vauntico_achievements", JSON.stringify(achievements));
```

---

## 🎮 Role-Based Flows

### Solo Creator (5 steps)

1. Install CLI
2. Authenticate
3. Set profile
4. First generation
5. Setup templates (optional)

### Agency (7 steps)

1. Install agency CLI
2. Authenticate
3. Enable agency mode
4. Onboard first client
5. Run first audit
6. Setup branding (optional)
7. Enable automation (optional)

### Team Lead (4 steps)

1. Install team CLI
2. Authenticate
3. Create team
4. Setup shared templates

---

## 🏆 Achievement System

### Available Achievements:

| ID                    | Name                 | Description             | Trigger                   |
| --------------------- | -------------------- | ----------------------- | ------------------------- |
| `first-install`       | CLI Novice           | Installed Vauntico CLI  | Complete install step     |
| `first-auth`          | Authenticated        | Connected account       | Complete auth step        |
| `first-generation`    | Dream Weaver         | Generated first content | First generation complete |
| `first-client`        | Agency Pioneer       | Onboarded first client  | Agency onboarding         |
| `onboarding-complete` | CLI Master           | Completed onboarding    | All steps done            |
| `automation-setup`    | Automation Architect | Setup workflows         | Automation configured     |

### Adding New Achievements:

Edit `src/components/OnboardingProgress.jsx`:

```javascript
const ACHIEVEMENT_BADGES = [
  {
    id: "your-achievement-id",
    title: "Achievement Name",
    description: "How to unlock it",
    icon: "🎖️",
    color: "from-purple-400 to-blue-400",
  },
];
```

---

## 🔧 Customization

### Adding a New Role:

1. Edit `src/components/RoleSelector.jsx`:

```javascript
const roles = [
  // ... existing roles
  {
    id: "new-role",
    icon: "🚀",
    title: "New Role",
    subtitle: "Subtitle",
    description: "Description",
    path: "Your path description",
    scrollAccess: ["scroll-1", "scroll-2"],
    color: "from-green-500 to-teal-500",
  },
];
```

2. Add steps in `CLIOnboarding.jsx`:

```javascript
const ONBOARDING_STEPS = {
  "new-role": [
    // ... your steps
  ],
};
```

3. Update step counts in `OnboardingProgress.jsx`:

```javascript
const getTotalSteps = () => {
  const stepCounts = {
    "solo-creator": 5,
    agency: 7,
    "team-lead": 4,
    "new-role": 6, // Your count
  };
  return stepCounts[roleId] || 5;
};
```

---

## 🐛 Debugging

### Common Issues:

**Progress not saving:**

```javascript
// Check if localStorage is available
if (typeof Storage !== "undefined") {
  console.log("localStorage is supported");
} else {
  console.error("localStorage NOT supported");
}
```

**Commands not copying:**

```javascript
// Check clipboard API availability
if (navigator.clipboard) {
  navigator.clipboard.writeText(command);
} else {
  console.error("Clipboard API not available");
}
```

**Achievement not unlocking:**

```javascript
// Debug achievement system
const achievements = JSON.parse(
  localStorage.getItem("vauntico_achievements") || "[]",
);
console.log("Current achievements:", achievements);
```

---

## 🧪 Testing

### Manual Testing Checklist:

```bash
# Test onboarding flow
1. Clear localStorage: localStorage.clear()
2. Select role
3. Start onboarding
4. Complete all steps
5. Verify progress persists on refresh

# Test command generator
1. Navigate to supported scroll
2. Select command template
3. Fill in inputs
4. Generate command
5. Copy and verify

# Test achievement system
1. Complete specific steps
2. Check localStorage for new achievements
3. Verify badge appears in progress card
```

---

## 📝 Future Enhancements

- [ ] In-app terminal emulator (run CLI in browser)
- [ ] Real-time progress sync across devices
- [ ] Video walkthrough integration per step
- [ ] Community command template library
- [ ] CLI usage analytics dashboard

---

## 🆘 Support

**Issues:** GitHub Issues (TBD)  
**Discord:** Community Support Channel  
**Email:** support@vauntico.com  
**Docs:** `/lore` section

---

**Built with 🔥 by the Vauntico Engineering Team**  
Last Updated: 2025-01-26
