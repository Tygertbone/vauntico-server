# ⚡ CLI Onboarding - Quick Start Card

**5-Minute Integration Guide**

---

## 🎯 What You Built

An **interactive CLI onboarding system** that:

- Guides users through CLI setup step-by-step
- Generates custom commands from templates
- Tracks progress with achievements
- Bridges scrolls (docs) → CLI commands

---

## 🚀 How to Use (End User)

1. **Navigate to `/lore`**
2. **Select your role** (Creator/Agency/Team Lead)
3. **Click "Start Onboarding"**
4. **Follow the steps** (copy commands, verify, complete)
5. **Unlock achievements** as you progress
6. **Use Command Generator** in relevant scrolls

---

## 🛠️ How to Integrate (Developer)

### 1. Add Onboarding to Your Page

```jsx
import CLIOnboarding from "./components/CLIOnboarding";
import OnboardingProgress from "./components/OnboardingProgress";

function YourPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <>
      <OnboardingProgress
        roleId={selectedRole?.id}
        onStartOnboarding={() => setShowOnboarding(true)}
      />

      {showOnboarding && (
        <CLIOnboarding
          role={selectedRole}
          onComplete={() => setShowOnboarding(false)}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}
```

### 2. Add Command Generator to Scrolls

```jsx
import CLICommandGenerator from "./components/CLICommandGenerator";

function ScrollViewer({ scroll }) {
  return (
    <>
      {[
        "audit-as-a-service",
        "dream-mover-cli",
        "AGENCY_CLI_QUICKSTART",
      ].includes(scroll.id) && <CLICommandGenerator scrollId={scroll.id} />}
      {/* Your scroll content */}
    </>
  );
}
```

---

## 🎨 Key Components

| Component               | Purpose            | Location                              |
| ----------------------- | ------------------ | ------------------------------------- |
| **CLIOnboarding**       | Step-by-step modal | `/components/CLIOnboarding.jsx`       |
| **CLICommandGenerator** | Command builder    | `/components/CLICommandGenerator.jsx` |
| **OnboardingProgress**  | Progress tracker   | `/components/OnboardingProgress.jsx`  |

---

## 💾 Data Storage

**LocalStorage Keys:**

- `vauntico_cli_onboarding_{roleId}` → Per-role progress
- `vauntico_achievements` → Global achievement list

**Clear Data:**

```javascript
localStorage.removeItem("vauntico_cli_onboarding_solo-creator");
localStorage.removeItem("vauntico_achievements");
```

---

## 🏆 Achievements

| Badge                   | ID                    | Trigger                 |
| ----------------------- | --------------------- | ----------------------- |
| ⚡ CLI Novice           | `first-install`       | Install CLI             |
| 🔐 Authenticated        | `first-auth`          | Login complete          |
| 🎨 Dream Weaver         | `first-generation`    | First content generated |
| 🏢 Agency Pioneer       | `first-client`        | Onboard first client    |
| 👑 CLI Master           | `onboarding-complete` | Finish onboarding       |
| 🤖 Automation Architect | `automation-setup`    | Setup automation        |

---

## 🔧 Customize

### Add a New Role:

**1. RoleSelector.jsx**

```javascript
{
  id: 'new-role',
  icon: '🚀',
  title: 'New Role',
  subtitle: 'Subtitle',
  description: 'Description',
  scrollAccess: ['scroll-1', 'scroll-2']
}
```

**2. CLIOnboarding.jsx**

```javascript
const ONBOARDING_STEPS = {
  "new-role": [
    {
      id: "step1",
      title: "Step Title",
      description: "Description",
      icon: "⚡",
      command: "your-command",
      optional: false,
    },
  ],
};
```

**3. OnboardingProgress.jsx**

```javascript
const stepCounts = {
  "new-role": 5,
};
```

### Add Command Templates:

**CLICommandGenerator.jsx**

```javascript
const COMMAND_TEMPLATES = {
  "your-scroll-id": {
    category: "Category",
    icon: "🔧",
    commands: [
      {
        id: "cmd-id",
        name: "Command Name",
        template: "vauntico cmd --flag {{INPUT}}",
        inputs: [{ key: "INPUT", label: "Label", required: true }],
        description: "What it does",
      },
    ],
  },
};
```

---

## 🐛 Debug

**Check Progress:**

```javascript
const progress = localStorage.getItem("vauntico_cli_onboarding_solo-creator");
console.log(JSON.parse(progress));
```

**Check Achievements:**

```javascript
const achievements = localStorage.getItem("vauntico_achievements");
console.log(JSON.parse(achievements));
```

**Reset Everything:**

```javascript
localStorage.clear();
window.location.reload();
```

---

## 📊 Analytics Events (Future)

Track these for insights:

- `onboarding_started` → User begins onboarding
- `onboarding_step_completed` → Step finished
- `onboarding_step_skipped` → Optional step skipped
- `onboarding_completed` → Full flow done
- `command_generated` → User built a command
- `command_copied` → User copied command
- `achievement_unlocked` → Badge earned

---

## 🎯 Success Metrics

**Track These:**

- Onboarding completion rate (target: >60%)
- Average time to complete (target: <10 mins)
- Step drop-off points (identify friction)
- Command generator usage (frequency)
- Achievement unlock rate (engagement proxy)

---

## 📚 Documentation

- **Technical Spec:** `CLI_ONBOARDING_COMPLETE.md`
- **User Guide:** `CLI_ONBOARDING_USER_GUIDE.md`
- **Developer Readme:** `CLI_ONBOARDING_README.md`
- **QA Checklist:** `PHASE_3_QA_CHECKLIST.md`
- **Screenshots:** `CLI_ONBOARDING_DEMO_SCREENSHOTS.md`

---

## 🆘 Troubleshooting

| Issue                      | Solution                        |
| -------------------------- | ------------------------------- |
| Progress not saving        | Check localStorage availability |
| Modal not opening          | Verify role state is set        |
| Commands not copying       | Check clipboard API permissions |
| Achievements not unlocking | Verify achievement ID matches   |

---

## 🚀 Deploy Checklist

- [ ] All components imported correctly
- [ ] LocalStorage keys unique
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Achievements working
- [ ] Command generator functional
- [ ] Progress persists on refresh
- [ ] Documentation updated

---

## 🔥 What's Next?

**Phase 4 Options:**

1. **Enhanced Scroll Access UI** - Dynamic unlocks, upgrade prompts
2. **Polish Tier System** - Credit viz, calculator
3. **Community Features** - Share templates, leaderboards

**Recommended:** Start with Option 1 (Enhanced Scroll Access UI)

---

**Built with 🔥**  
**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** 2025-01-26

---

## 💡 Pro Tips

1. **Test with fresh localStorage** to simulate new user experience
2. **Use different roles** to see varied onboarding flows
3. **Check mobile views** - everything should work on small screens
4. **Monitor console** for any errors during testing
5. **Ask users for feedback** - iterate based on real usage

---

**🎉 You're Ready to Launch!**

Navigate to `http://localhost:3001/lore` and experience the magic.
