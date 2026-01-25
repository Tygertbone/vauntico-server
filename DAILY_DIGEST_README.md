# 📅 Vauntico Daily Digest Generator

Automated daily context generation for the Vauntico codebase to keep you aligned with current mission, blockers, and vision.

## 🎯 Purpose

This system generates a daily digest that provides:

- **Current Mission**: Phase 2 monetization goals and milestones
- **Known Blockers**: Critical issues preventing deployment/progress
- **Recent Changes**: Latest 10 git commits with semantic tags
- **Deployment Status**: Current environment health and pipeline status
- **Vision Anchor**: Reminds you of Vauntico's core mission (FICO score for creators)
- **Repo Map**: Directory structure for quick navigation

## 📁 Files Created

1. **`generate_digest.py`** - Main Python script that generates the digest
2. **`setup_daily_digest_task.ps1`** - PowerShell script to create Windows Task Scheduler entry
3. **`daily_digest.md`** - Generated digest file (overwritten daily)

## 🚀 Quick Start

### Option 1: Manual Setup (Recommended)

1. **Run the setup script**:

   ```powershell
   cd C:\Users\admin\vauntico-mvp
   .\setup_daily_digest_task.ps1
   ```

2. **Answer prompts** - The script will:
   - Check Python installation
   - Create scheduled task for daily 9 AM execution
   - Test run immediately
   - Show you the generated digest

### Option 2: Manual Generation Only

```bash
cd C:\Users\admin\vauntico-mvp
python generate_digest.py
```

## 📋 Generated Digest Structure

```markdown
You are working inside the Vauntico codebase. Before you act, always keep this context in mind:

## 📅 Digest Date

2026-01-25

## 📂 Repo Map

[Directory structure to 2 levels deep]

## 🎯 Current Mission

Phase 2: Monetization (Months 4-6) - Activating Pro tier subscriptions...

## 🚧 Known Blockers

- Missing 13 GitHub Secrets...
- Test suite failures...

## 📝 Recent Changes

[Last 10 git commits with semantic tags]

## 🌐 Deployment Status

⚠️ PARTIALLY READY - Critical blockers remain...

## 🔮 Vision Anchor

Vauntico is building "FICO score for creators"...

---

When coding, always reason with this context first...
```

## ⚙️ How It Works

### Python Script (`generate_digest.py`)

- **Repo Map**: Walks directory structure up to 2 levels deep
- **Recent Changes**: Grabs last 10 commits with `git log --oneline`
- **Digest Date**: Stamps with current date in YYYY-MM-DD format
- **Output**: Saves to `daily_digest.md` in repo root

### PowerShell Setup (`setup_daily_digest_task.ps1`)

- **Task Creation**: Creates Windows Task Scheduler entry
- **Schedule**: Daily at 9:00 AM (customizable)
- **Execution**: Runs with highest privileges
- **Testing**: Immediate test run to verify setup
- **Cleanup**: Removes any existing task before creating new one

## 🔧 Customization

### Change Schedule Time

Edit the PowerShell script:

```powershell
$Trigger = New-ScheduledTaskTrigger -Daily -At 10am # Change to 10 AM
```

Or modify in Windows Task Scheduler:

1. Win+R → `taskschd.msc`
2. Find "Vauntico Daily Digest Generator"
3. Right-click → Properties → Triggers
4. Edit the time

### Change Repo Depth

Edit `generate_digest.py`:

```python
repo_tree = get_repo_tree(REPO_PATH, depth=3) # Go 3 levels deep
```

### Change Commit Count

Edit `generate_digest.py`:

```python
commits = get_recent_commits(n=20) # Show last 20 commits
```

## 🐛 Troubleshooting

### Python Not Found

```
ERROR: Python not found. Please install Python first.
```

**Solution**: Install Python from python.org or via Windows Store

### Task Creation Failed

```
ERROR: Failed to create scheduled task: Access is denied
```

**Solution**: Run PowerShell as Administrator

### Git Commands Fail

```
Error fetching commits: fatal: not a git repository
```

**Solution**: Ensure you're in the correct repo directory

### Digest File Not Generated

**Check**:

1. Python script runs without errors
2. Git repository is accessible
3. Write permissions in repo directory

## 📅 Daily Workflow

### Morning Routine (9:00 AM)

1. **Digest Auto-Generated**: `daily_digest.md` updated
2. **Open in Editor**: Load the digest in your IDE
3. **Copy to Cline**: Paste the entire digest as your first message
4. **Plan Work**: Use current mission and blockers to prioritize tasks

### Example Cline Session Start

```
You are working inside the Vauntico codebase. Before you act, always keep this context in mind:

## 📅 Digest Date
2026-01-25

## 🎯 Current Mission
Phase 2: Monetization...

I need to work on resolving the critical deployment blockers. What's the best approach to tackle the missing GitHub secrets?
```

## 🔍 Context Integration

### Using the Digest for Development Decisions

**Before starting any task**:

1. **Check Current Mission**: "Does this align with Phase 2 monetization?"
2. **Review Blockers**: "Am I working around critical issues or fixing them?"
3. **Consider Vision**: "Does this move us closer to FICO score for creators?"

### Example Decision Framework

```
User: "Add new analytics dashboard"
Digest Context:
- Mission: Phase 2 monetization (Pro tier activation)
- Blockers: Missing secrets, test failures
- Vision: FICO score for creators

Analysis:
- Dashboard supports monetization ✅
- Doesn't address critical blockers ❌
- Aligns with trust scoring vision ✅
Conclusion: Proceed after blockers resolved
```

## 📊 Maintenance

### Weekly Tasks

1. **Update Mission**: Adjust as Vauntico progresses through phases
2. **Refresh Blockers**: Update current critical issues
3. **Verify Scripts**: Ensure digest generation still works
4. **Check Schedules**: Confirm Task Scheduler still running

### Monthly Tasks

1. **Update Vision**: Refine vision anchor as company evolves
2. **Audit Context**: Ensure all sections remain relevant
3. **Backup Configuration**: Export Task Scheduler settings

## 🚀 Advanced Usage

### Multiple Environments

Create separate scripts for different contexts:

```bash
# Development context
python generate_digest.py --env dev

# Production context
python generate_digest.py --env prod
```

### Integration with IDEs

**VS Code**: Add to startup tasks

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate Daily Digest",
      "type": "shell",
      "command": "python generate_digest.py",
      "group": "build"
    }
  ]
}
```

### Git Hook Integration

Add to `.git/hooks/post-checkout`:

```bash
#!/bin/bash
python generate_digest.py
```

## 📞 Support

### Issues and Enhancement Requests

1. **Check this README** for common solutions
2. **Review script outputs** for error messages
3. **Test manually** with `python generate_digest.py`
4. **Verify Task Scheduler** in Windows Task Scheduler GUI

### Common Enhancement Ideas

- [ ] Add environment detection (dev/staging/prod)
- [ ] Include weather/external context
- [ ] Add team member status updates
- [ ] Integrate with project management tools
- [ ] Add AI-powered task prioritization

---

**✨ The daily digest ensures every coding session starts with full context, keeping you aligned with Vauntico's mission and vision.**

**🎯 Created by**: Vauntico Development Team  
**📅 Last Updated**: 2026-01-25  
**🔄 Version**: 1.0.0
