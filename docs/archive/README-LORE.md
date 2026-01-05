# 🧿 Lore Generator - Mythic Git Commits

Transform your mundane git commits into epic mythic narratives!

## ✨ What You Get

Instead of boring commits like:
```
fix: update validation logic
```

You get epic narratives like:
```
🧿 VaultDashboard purified · 2025-10-18 · replay protection toggled and metrics sealed
```

## 🚀 Quick Start (30 seconds)

```bash
# 1. Stage your changes
git add .

# 2. Commit with lore
npm run commit

# 3. Push
git push
```

**That's it!** Your commit now has a mythic message. 🎉

## 📖 Documentation

- **[LORE-INSTALLATION-COMPLETE.md](./LORE-INSTALLATION-COMPLETE.md)** - Complete setup guide and reference
- **[LORE-DEMO.md](./LORE-DEMO.md)** - Step-by-step tutorial with examples
- **[LORE-GENERATOR-README.md](./LORE-GENERATOR-README.md)** - Detailed technical documentation

## 🎯 Usage Methods

### Method 1: NPM Scripts (Easiest)
```bash
npm run lore       # Preview message
npm run commit     # Commit with lore
```

### Method 2: Git Alias
```bash
git commit-lore    # Commit with lore
```

### Method 3: Quick Commit Script
```powershell
.\quick-commit.ps1      # Interactive commit + optional push
.\quick-commit.ps1 -Preview  # Just preview
```

### Method 4: Direct Command
```bash
node lore-generator.js --commit
```

## 🎨 Message Format

```
[emoji] [Component] [mythic-verb] · [date] · [ritual-description]
```

**Example:**
```
🧿 VaultDashboard purified · 2025-10-18 · replay protection toggled and metrics sealed
│  │               │         │            │
│  │               │         │            └─ Ritual description (detected from code changes)
│  │               │         └─ Timestamp (YYYY-MM-DD)
│  │               └─ Mythic verb (randomly selected)
│  └─ Component name (extracted from file names)
└─ Emoji (based on commit type)
```

## 🧬 Emojis by Commit Type

The generator automatically detects your commit type:

| Emoji | Type | Trigger |
|-------|------|---------|
| 🧿 | feat | New features (default) |
| ⚡ | fix | Bug fixes, "fix" in diff |
| 🔮 | refactor | Code refactoring |
| 📜 | docs | README, .md files |
| ✨ | style | CSS, styling changes |
| 🗡️ | test | Test files (.spec, .test) |
| 🛡️ | chore | package.json, config |
| 🔥 | perf | Performance optimization |
| ⚒️ | build | Build system |
| 🌙 | ci | CI/CD |

## 🔮 Intelligent Pattern Detection

The generator analyzes your code changes and detects patterns:

### Security & Validation
- **replay protection toggled** - Detects nonce/timestamp validation
- **wards strengthened** - Security/auth changes
- **validation enhanced** - Validation logic

### State & Performance
- **state harmonized** - State management
- **metrics sealed** - Analytics/tracking
- **performance optimized** - Optimization code

### Development
- **tests forged** - Test files
- **documentation inscribed** - Docs
- **hooks conjured** - React hooks
- **types aligned** - TypeScript changes

...and many more! See [full list](./LORE-GENERATOR-README.md#ritual-descriptions)

## 🌟 Real Examples

From actual commits:

```bash
🧿 VaultDashboard purified · 2025-10-18 · replay protection toggled and metrics sealed
⚡ AuthService awakened · 2025-10-18 · error handling blessed
🔮 ApiClient transmuted · 2025-10-18 · performance optimized
📜 README consecrated · 2025-10-18 · documentation inscribed
✨ Button fortified · 2025-10-18 · styles refined
🗡️ ValidationTests illuminated · 2025-10-18 · tests forged
🛡️ Dependencies sanctified · 2025-10-18 · dependencies updated
```

## 🛠️ Complete Workflow

```bash
# Make your changes
code src/components/VaultDashboard.tsx

# Stage files
git add .

# Preview the mythic message (optional)
npm run lore

# Commit with lore
npm run commit

# Push to remote
git push
```

Or use the one-command helper:
```powershell
.\quick-commit.ps1
```

## ⚙️ Configuration

### Set Up Git Alias (One-Time Setup)
Already done by setup script, but if needed:
```bash
git config --global alias.commit-lore "!node ./lore-generator.js --commit"
```

### Verify Setup
```bash
# Check git alias
git config --get alias.commit-lore

# Check npm scripts
npm run lore
```

## 🎓 Help & Options

```bash
# Show help
node lore-generator.js --help

# Preview only
npm run lore

# Commit immediately
npm run commit
```

## 📚 Learn More

- **[Quick Demo](./LORE-DEMO.md)** - Try it in 2 minutes
- **[Full Installation Guide](./LORE-INSTALLATION-COMPLETE.md)** - Complete reference
- **[Technical Docs](./LORE-GENERATOR-README.md)** - Customization & advanced usage

## 🎮 Try It Now!

```bash
# Stage the lore generator files
git add lore-generator.js LORE*.md setup-lore.ps1 quick-commit.ps1

# Generate your first mythic commit
npm run commit

# See the result
git log -1
```

## 🌌 Integration with Your Workflow

The lore generator integrates seamlessly:

```bash
# Your normal workflow
git add .
git commit -m "fix bug"  # ← Replace this
git push

# With lore generator
git add .
npm run commit           # ← With this!
git push
```

Or for the ultimate experience:
```bash
git add . && npm run commit && git push
```

## 🔧 Customization

Want to add your own mythic verbs or patterns? Edit `lore-generator.js`:

- **Line 28**: Add more MYTHIC_VERBS
- **Line 15**: Change MYTHIC_PREFIXES emojis
- **Line 115**: Add custom pattern detection

See [Customization Guide](./LORE-GENERATOR-README.md#customization)

## 💡 Tips

1. **Preview first**: Use `npm run lore` to see the message before committing
2. **Batch commits**: Stage related files for better component detection
3. **Custom patterns**: Add project-specific patterns to `lore-generator.js`
4. **Git hooks**: Set up automatic lore messages (see advanced docs)

## 🐛 Troubleshooting

**"No staged files found"**
```bash
git add .  # Stage files first
```

**Emojis look weird in PowerShell**
- They display correctly in git log and on GitHub/GitLab
- Use `git log --oneline` to see them properly

**Script not found**
- Make sure you're in the project root
- Check file exists: `ls lore-generator.js`

## 📦 What's Included

| File | Purpose |
|------|---------|
| `lore-generator.js` | Main generator script |
| `LORE-GENERATOR-README.md` | Technical documentation |
| `LORE-DEMO.md` | Quick tutorial |
| `LORE-INSTALLATION-COMPLETE.md` | Setup guide |
| `setup-lore.ps1` | Automated setup |
| `quick-commit.ps1` | Interactive commit helper |
| `package.json` | Updated with npm scripts |

## 🎉 Ready to Begin?

Your mythic journey starts here:

```bash
git add .
npm run commit
```

**May your commits be legendary!** 🧿✨

---

**Questions?** Check the [detailed documentation](./LORE-INSTALLATION-COMPLETE.md)

**Need help?** Run `node lore-generator.js --help`
