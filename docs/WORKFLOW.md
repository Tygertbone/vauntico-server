# Vauntico Documentation Workflow

> **Purpose:** Guidelines for maintaining CONTEXT.md and ARCHITECTURE.md across development sessions  
> **Last Updated:** 2024-12-28

---

## 📚 Overview

This document explains how to keep project memory fresh by updating **CONTEXT.md** and **ARCHITECTURE.md** at key milestones.

---

## 📋 When to Update CONTEXT.md

Update `CONTEXT.md` when you:

### ✅ Complete a Major Feature

- [ ] New page or route added
- [ ] New component system implemented
- [ ] Analytics or tracking integration
- [ ] Payment gateway connected
- [ ] User authentication added
- [ ] R2,000 Challenge content added (new day lessons)
- [ ] Community structure changes (WhatsApp groups)

**What to Update:**

- Current Development Status section
- Add feature to Key Technologies if new dependency
- Document decision in Important Decisions section
- Update Current Goals based on what's left

**Example:**

```markdown
### ✅ Phase 6: User Authentication - Complete

- Auth0 integration for login/signup
- JWT token management
- Protected routes with redirect
- User profile management
```

---

### ✅ Make Important Architectural Decisions

Examples:

- Choosing a state management library (Redux, Zustand, etc.)
- Selecting a payment provider (Stripe vs Paddle)
- Database choice (Supabase, Firebase, PostgreSQL)
- Auth provider (Clerk, Auth0, custom)

**What to Update:**

- Add new entry to Important Decisions & Rationale section
- Explain why this choice was made
- Note any alternatives considered

**Template:**

```markdown
### X. [Decision Title]

**Decision:** [What was decided]
**Why:** [Rationale with 2-3 bullet points]
**Alternatives Considered:** [Other options]
```

---

### ✅ Change Development Priorities

Update the "Current Goals & Next Priorities" section when:

- Completing a milestone shifts focus
- Business priorities change
- User feedback requires pivoting
- Technical debt needs addressing

**What to Update:**

- Move completed items from "Immediate" to a new "Recently Completed" section
- Promote "Short-Term" items to "Immediate"
- Add new items based on feedback/roadmap

---

### ✅ Add or Change Naming Conventions

When introducing new patterns:

- Component naming changes
- New folder structure
- API endpoint conventions
- Event naming standards

**What to Update:**

- Naming Conventions & Patterns section
- Add examples
- Note when to use each pattern

---

### ✅ Introduce New Key Concepts

When adding major features that need explanation:

- New user-facing features (e.g., "Soul Forge", "Vault Ritual")
- Internal systems (e.g., "Credit Ledger", "Referral Engine")
- Terminology that team members need to understand

**What to Update:**

- Key Concepts section
- Provide 2-3 sentence explanation
- Link to relevant documentation

---

## 🏗️ When to Update ARCHITECTURE.md

Update `ARCHITECTURE.md` when you:

### ✅ Add New Folders or Files

Significant additions:

- New `/api` folder for backend routes
- New component categories
- New utility modules
- Test directories

**What to Update:**

- Project Structure section
- Add to file tree with brief description

---

### ✅ Change Component Structure

When refactoring:

- Breaking large components into smaller ones
- Creating new shared components
- Reorganizing component hierarchy

**What to Update:**

- Component Architecture section
- Update component descriptions
- Note new patterns

---

### ✅ Modify Data Flow

Changes to how data moves through the app:

- Adding React Context
- Implementing state management library
- Changing prop drilling patterns
- Adding data fetching layer

**What to Update:**

- Data Flow section
- Update diagrams/flowcharts
- Show before/after if major change

---

### ✅ Implement Database Schema

When database goes live:

- Tables created
- Relationships defined
- Indexes added

**What to Update:**

- Database Schema section
- Change from "Planned" to "Active"
- Add actual table definitions
- Note migrations approach

---

### ✅ Build API Endpoints

When backend routes are implemented:

- Authentication endpoints
- CRUD operations
- Webhook handlers
- Third-party integrations

**What to Update:**

- API Structure section
- Mark endpoints as "Active" vs "Planned"
- Add request/response examples
- Document authentication requirements

---

### ✅ Add New Integrations

Third-party services:

- Payment processors
- Email providers
- SMS services
- Cloud storage

**What to Update:**

- Key Integrations section
- Add configuration details
- Note environment variables needed
- Include setup instructions

---

### ✅ Change Build Configuration

Modifications to:

- Vite/Webpack config
- Tailwind config
- ESLint rules
- Build scripts

**What to Update:**

- Build & Deployment section
- Note new build steps
- Update environment variables
- Document new commands

---

## 🔄 Periodic Sync Checklist

Every **2-3 development sessions** or **once per week**, run this sync:

### CONTEXT.md Review

- [ ] Update "Last Updated" date
- [ ] Check if "Current Development Status" is accurate
- [ ] Verify "Current Goals" reflect actual priorities
- [ ] Add any new decisions made
- [ ] Update any changed conventions

### ARCHITECTURE.md Review

- [ ] Update "Last Updated" date
- [ ] Ensure project structure matches reality
- [ ] Verify component descriptions are current
- [ ] Check if data flow diagrams need updates
- [ ] Update dependency versions if changed

### Quick Test

- [ ] Read both docs and ask: "Could a new developer understand the project?"
- [ ] Scan for outdated information (planned features that shipped)
- [ ] Check for broken links or references

---

## 💬 Conversation Starters

Use these prompts with Continue/AI assistant:

### At Start of Session

```
Please read CONTEXT.md and ARCHITECTURE.md to understand
the project before we continue. Let me know if anything
seems outdated.
```

### After Completing Feature

```
We just completed [feature name]. Please update CONTEXT.md
with this accomplishment and adjust our priorities. Also
update ARCHITECTURE.md if the structure changed.
```

### After Making Decision

```
We decided to use [technology/approach] for [reason].
Please add this to the Important Decisions section in
CONTEXT.md with rationale.
```

### Weekly Sync

```
Let's do a quick sync - review CONTEXT.md and ARCHITECTURE.md
and update anything that's changed or missing since last week.
```

### Before Major Refactor

```
We're about to refactor [component/system]. First, let's
document the current architecture in ARCHITECTURE.md so we
have a before snapshot.
```

### After Deployment

```
We just deployed to production. Please update both docs to
reflect the live state and note any post-deploy observations.
```

---

## 🎯 Quality Checklist

Before closing a major work session, verify:

### CONTEXT.md Quality

- [ ] Status is current (not 2+ phases behind)
- [ ] Goals are actionable and realistic
- [ ] Decisions include "why" not just "what"
- [ ] Conventions have examples
- [ ] No placeholder text like "TBD" or "TODO"

### ARCHITECTURE.md Quality

- [ ] File tree matches actual structure
- [ ] Component descriptions are accurate
- [ ] Data flows are up-to-date
- [ ] API endpoints match implementation
- [ ] Dependencies list is current

---

## 📝 Update Templates

### Quick Update (5 minutes)

```markdown
**Date:** [YYYY-MM-DD]
**Changed:** [Brief description]
**Files Updated:** CONTEXT.md / ARCHITECTURE.md / Both
**Sections:** [List sections changed]
```

### Feature Completion Update (15 minutes)

```markdown
**Feature:** [Name]
**Status:** Complete

**CONTEXT.md Updates:**

- Current Status: [Update]
- New Decision: [If applicable]
- Goals Adjusted: [Changes]

**ARCHITECTURE.md Updates:**

- Components Added: [List]
- Data Flow: [Changes if any]
- Integrations: [New services]
```

---

## 🚨 Red Flags (Time to Update!)

Update immediately if you notice:

❌ **CONTEXT.md shows "Phase 3" but you're in Phase 6**
❌ **ARCHITECTURE.md references files that don't exist**
❌ **Current Goals include items completed 2 months ago**
❌ **New team member is confused by outdated docs**
❌ **AI assistant suggests outdated approaches based on docs**
❌ **Important decision isn't documented anywhere**

---

## 🎓 Best Practices

### Do ✅

- Update docs while context is fresh (same day as change)
- Write for your future self (6 months from now)
- Include "why" not just "what"
- Use examples and code snippets
- Keep it concise but complete
- Link to detailed docs when appropriate

### Don't ❌

- Wait until end of sprint to update everything
- Write overly technical details (save for code comments)
- Copy-paste without adapting to current state
- Leave placeholder sections for "later"
- Assume you'll remember details later
- Over-explain trivial decisions

---

## 📊 Success Metrics

Your documentation is working well if:

✅ New conversation with AI starts with accurate context  
✅ You can resume work after 1 week without confusion  
✅ New developer can onboard using these docs  
✅ Decisions are justified and traceable  
✅ Architecture matches actual codebase  
✅ No "how did we build this again?" moments

---

## 🔗 Related Documents

- **CONTEXT.md** - What and why
- **ARCHITECTURE.md** - How and where
- **README.md** - Public-facing overview
- **PHASE_X_COMPLETE.md** - Detailed feature docs

---

## 💡 Pro Tips

1. **Set a Calendar Reminder:** Weekly Friday 4pm - "Update Vauntico docs"

2. **Git Commit Messages:** Reference docs in commits:

   ```
   feat: Add user authentication

   - Implement Auth0 integration
   - Update CONTEXT.md with decision rationale
   - Update ARCHITECTURE.md with auth flow
   ```

3. **Use AI Effectively:** Let AI help maintain docs, but always review for accuracy

4. **Version Docs:** When making major updates, keep old version for reference:

   ```
   CONTEXT_v5.md (archived)
   CONTEXT.md (current)
   ```

5. **Document Retrospectively:** If docs fall behind, schedule 1 hour to catch up completely

---

## 🎯 Quick Reference Card

**Print this and keep nearby:**

```
┌─────────────────────────────────────────────┐
│  WHEN TO UPDATE DOCUMENTATION               │
├─────────────────────────────────────────────┤
│  ✓ Shipped major feature                    │
│  ✓ Made architectural decision              │
│  ✓ Changed project priorities               │
│  ✓ Added new integration                    │
│  ✓ Modified file structure                  │
│  ✓ Completed development phase              │
│  ✓ Every Friday (weekly sync)               │
└─────────────────────────────────────────────┘

QUICK COMMAND:
"Let's update CONTEXT.md and ARCHITECTURE.md
to reflect today's changes"
```

---

**Remember:** Good documentation is written **during** development, not after.

**Next Review:** Schedule in 1 week or after next major feature 🗓️

---

## 🦄 R2,000 Challenge Content Workflow

### Adding New Day Lessons

**Location:** `/content/r2000/days/day-XX.md`

**Required Fields:**

- `day`: Number (1-60)
- `phase`: foundation | monetization | scale
- `title`: Lesson title
- `duration`: Estimated time
- `objective`: What student achieves

**Content Structure:**

1. Today's Mission (overview)
2. Video Tutorial (YouTube embed if available)
3. Step-by-Step Guide
4. Action Checklist
5. Win of the Day (motivation)
6. Tomorrow's Preview

**Update Docs:**

- [ ] Add day to content folder
- [ ] Test rendering in DayLesson.jsx
- [ ] Update CONTEXT.md if major milestone
- [ ] Announce in Ubuntu R2K Creators Hub

### Updating Bonuses

**Templates** (`/content/r2000/bonuses/templates.md`):

- 100 viral content templates by niche
- Copy-paste ready format
- Update when new proven templates emerge

**Brands Directory** (`/content/r2000/bonuses/brands.md`):

- 200+ African brands
- Contact info, rates, application process
- Update monthly (brands change fast)
- Organize by: Finance, Tech, Beauty, Fashion

**Resources** (`/content/r2000/bonuses/resources.md`):

- Free tools & apps
- Phone-only workflow guides
- Update when new tools recommended

### Community Management (Ubuntu R2K Creators Hub)

**Structure Changes:**

- Document in CONTEXT.md
- Announce in WhatsApp Announcements channel
- Update welcome message
- Pin important updates

**Moderation:**

- Keep rules in `/docs/COMMUNITY_GUIDELINES.md`
- Update when policy changes
- Share with new moderators

---

**R2,000 Challenge Status:** Phase 6 In Progress  
**Next Content Milestone:** Days 1-7 complete for MVP launch
