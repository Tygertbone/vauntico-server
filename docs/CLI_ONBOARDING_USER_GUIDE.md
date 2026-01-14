# 🎓 CLI Onboarding User Guide

## Quick Start

### 1. Choose Your Role

Navigate to `/lore` and select your path:

- 👨‍💻 **Solo Creator**: Building your empire
- 🏢 **Agency Partner**: Scale your services
- 👥 **Team Lead**: Organize your squad

### 2. Start Onboarding

After selecting a role, you'll see your **Onboarding Progress Card**:

```
┌─────────────────────────────────────────┐
│ 🌱 CLI Onboarding Progress             │
│ Ready to begin your journey             │
│                                         │
│ ▓▓▓░░░░░░░░░░░░░░░░░░░ 20%            │
│ 1 of 5 steps                           │
│                                         │
│ [🚀 Start Onboarding]                  │
└─────────────────────────────────────────┘
```

### 3. Follow Interactive Steps

Each step includes:

- **Clear instructions** - What you're doing and why
- **Copy-paste commands** - Click to copy to clipboard
- **Verification steps** - How to confirm success
- **Scroll references** - Links to detailed docs
- **Optional indicators** - Skip non-essential steps

Example step:

```
┌─────────────────────────────────────────┐
│ ⚡ Install Dream Mover CLI              │
│ Get the command-line tools on your      │
│ machine                                 │
│                                         │
│ Primary Command:                        │
│ $ npm install -g @vauntico/cli         │
│                                     [📋]│
│                                         │
│ Verify Installation:                    │
│ $ vauntico --version                   │
│                                         │
│ Expected Result:                        │
│ ✓ vauntico v2.0.0                      │
│                                         │
│ 📜 Related Scroll: dream-mover-cli     │
│                                         │
│ [← Previous]    [Skip] [Mark Complete→]│
└─────────────────────────────────────────┘
```

---

## Using the CLI Command Generator

### When scrolling through CLI-related scrolls, you'll see:

```
┌─────────────────────────────────────────────┐
│ 🎨 CLI Command Generator                    │
│ Content Generation                          │
│                                             │
│ SELECT COMMAND:          CONFIGURE:         │
│ ┌──────────────────┐    ┌────────────────┐│
│ │ Generate Blog    │    │ Topic:         ││
│ │ Generate Image   │    │ [___________ ] ││
│ │ Save Template    │    │                ││
│ └──────────────────┘    │ Word Count:    ││
│                         │ [1000 ▼]       ││
│                         │                ││
│                         │ [⚡ Generate]  ││
│                         └────────────────┘│
│                                             │
│ YOUR COMMAND:                               │
│ $ vauntico generate text \                 │
│   --prompt "Your topic" \                  │
│   --style blog --length 1000               │
│                                        [📋]│
└─────────────────────────────────────────────┘
```

### Steps:

1. **Select a command template** from the left panel
2. **Fill in required fields** (marked with \*)
3. **Click "Generate Command"**
4. **Copy and run** in your terminal

---

## Achievement System

Unlock badges as you progress:

| Badge | Name                 | How to Unlock          |
| ----- | -------------------- | ---------------------- |
| ⚡    | CLI Novice           | Install Vauntico CLI   |
| 🔐    | Authenticated        | Connect your account   |
| 🎨    | Dream Weaver         | Generate first content |
| 🏢    | Agency Pioneer       | Onboard first client   |
| 👑    | CLI Master           | Complete onboarding    |
| 🤖    | Automation Architect | Setup workflows        |

View your achievements by expanding the progress card:

```
┌─────────────────────────────────────────┐
│ 🏆 Achievements                    3/6  │
│                                         │
│ ⚡ CLI Novice        🔐 Authenticated  │
│ 🎨 Dream Weaver     🔒 (Locked)        │
│ 🔒 (Locked)         🔒 (Locked)        │
└─────────────────────────────────────────┘
```

---

## Tips & Tricks

### 💡 Save Time with Aliases

After completing onboarding, create shell aliases:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias vg="vauntico generate"
alias va="vauntico audit run"
alias vc="vauntico config"
```

### 📋 Batch Operations

Use the command generator to create a batch script:

```bash
#!/bin/bash
# Generated batch commands
vauntico audit run --url site1.com
vauntico audit run --url site2.com
vauntico audit run --url site3.com
```

### 🔄 Reset Progress

Need to start over? Expand the progress card and click **"Reset Progress"**.

### 🎯 Jump Between Steps

Click any completed step number in the navigation bar to revisit.

---

## Keyboard Shortcuts

| Key      | Action                 |
| -------- | ---------------------- |
| `ESC`    | Close onboarding modal |
| `←`      | Previous step          |
| `→`      | Next step              |
| `Ctrl+C` | Copy current command   |

---

## FAQ

### Q: What if I already have the CLI installed?

**A:** You can skip to verification steps or mark steps as complete immediately.

### Q: Can I do onboarding later?

**A:** Yes! Your progress saves automatically. Return anytime.

### Q: Do I need Creator Pass for CLI?

**A:** Basic CLI is free. Creator Pass unlocks advanced features and higher usage limits.

### Q: Can I change my role?

**A:** Yes! Go back to role selection and choose a different path. Your progress saves per role.

### Q: What if a command fails?

**A:** Check the scroll reference for troubleshooting or contact support.

---

## Support Resources

- 📚 **Full CLI Docs**: `/lore` → View scrolls
- 💬 **Discord Community**: Get help from other users
- 📧 **Email Support**: support@vauntico.com
- 🎥 **Video Tutorials**: Coming soon

---

## What's Next?

After completing CLI onboarding:

1. ✨ **Explore Scrolls** - Deep dive into specific features
2. 🎨 **Generate Content** - Use Dream Mover CLI
3. 📊 **Run Audits** - If you're an agency
4. 🤝 **Join Community** - Share your success
5. 🚀 **Upgrade Pass** - Unlock pro features

---

**Happy Building! 🔥**
