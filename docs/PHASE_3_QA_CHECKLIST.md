# ✅ Phase 3: CLI Onboarding - QA Checklist

**Status:** Ready for Testing  
**Date:** 2025-01-26

---

## 🧪 Functional Testing

### CLIOnboarding Component

- [ ] **Role Selection**
  - [ ] Solo Creator shows 5 steps
  - [ ] Agency shows 7 steps
  - [ ] Team Lead shows 4 steps
  - [ ] Modal opens when clicking "Start Onboarding"

- [ ] **Step Navigation**
  - [ ] Progress bar updates correctly
  - [ ] "Previous" button works (except on step 1)
  - [ ] "Mark Complete" advances to next step
  - [ ] "Skip" button only appears for optional steps
  - [ ] Click on step numbers to jump between completed steps
  - [ ] Cannot jump to uncompleted steps

- [ ] **Command Blocks**
  - [ ] Commands display in terminal-style formatting
  - [ ] "Copy" button copies command to clipboard
  - [ ] Success feedback shows ("Copied!")
  - [ ] Alternative commands shown where applicable
  - [ ] Verification commands display correctly

- [ ] **Scroll References**
  - [ ] "Open Scroll" links work
  - [ ] Links open in new tab
  - [ ] Correct scroll loaded

- [ ] **Progress Persistence**
  - [ ] Progress saves on step completion
  - [ ] Progress loads on page refresh
  - [ ] Reset button clears progress
  - [ ] Separate progress per role

- [ ] **Modal Interactions**
  - [ ] Close button (×) works
  - [ ] ESC key closes modal
  - [ ] Click outside modal does NOT close (intentional)
  - [ ] Completion awards achievement

---

### CLICommandGenerator Component

- [ ] **Template Selection**
  - [ ] Templates load for supported scrolls
  - [ ] Template selection updates right panel
  - [ ] Active template highlighted
  - [ ] "No templates" message for unsupported scrolls

- [ ] **Form Inputs**
  - [ ] Text inputs accept typing
  - [ ] Select dropdowns show options
  - [ ] Required fields marked with \*
  - [ ] Placeholder text helpful
  - [ ] Input values persist during session

- [ ] **Command Generation**
  - [ ] "Generate" button disabled until required fields filled
  - [ ] Generated command appears in terminal block
  - [ ] Placeholders replaced with input values
  - [ ] Empty optional fields handled gracefully
  - [ ] Copy button works for generated command

- [ ] **Scroll Context**
  - [ ] Generator shows for: audit-as-a-service, dream-mover-cli, AGENCY_CLI_QUICKSTART, 10-agency-scroll, creator-pass
  - [ ] Hidden for other scrolls
  - [ ] Correct templates load per scroll

---

### OnboardingProgress Component

- [ ] **Progress Display**
  - [ ] Percentage calculated correctly
  - [ ] Step counter accurate (X of Y)
  - [ ] Progress bar fills proportionally
  - [ ] Status emoji changes based on progress (🌱→🌿→🌳→⚡→🏆)
  - [ ] Status message updates

- [ ] **Expandable Details**
  - [ ] Click arrow to expand/collapse
  - [ ] Step breakdown shows completed/skipped/remaining
  - [ ] Achievement grid displays
  - [ ] Quick actions visible when expanded

- [ ] **Achievements**
  - [ ] Unlocked achievements show icon + color
  - [ ] Locked achievements show 🔒
  - [ ] Achievement count accurate (X / 6)
  - [ ] Badges persist across sessions

- [ ] **Action Buttons**
  - [ ] "Start Onboarding" appears when 0% complete
  - [ ] "Continue Onboarding" appears when >0% and <100%
  - [ ] Completion message shows when 100%
  - [ ] Reset confirms before clearing

- [ ] **Mini Version**
  - [ ] OnboardingProgressMini displays percentage
  - [ ] Progress bar accurate
  - [ ] "CLI Ready" badge shows when 100%

---

## 🎨 UI/UX Testing

### Visual Design

- [ ] Gradient colors (purple → blue) consistent
- [ ] Card borders and shadows correct
- [ ] Typography hierarchy clear
- [ ] Icons display properly (emojis render)
- [ ] Hover states work on interactive elements
- [ ] Focus states visible for accessibility

### Responsive Design

- [ ] **Desktop (1920x1080)**
  - [ ] Modal width appropriate
  - [ ] Two-column layouts side-by-side
  - [ ] No horizontal scrolling

- [ ] **Tablet (768x1024)**
  - [ ] Modal adapts to screen
  - [ ] Command generator stacks columns
  - [ ] Buttons remain accessible

- [ ] **Mobile (375x667)**
  - [ ] Modal full-width with padding
  - [ ] Single-column layouts
  - [ ] Touch targets large enough
  - [ ] Scrolling smooth

### Animations

- [ ] Progress bar fills smoothly
- [ ] Step transitions smooth
- [ ] Toast notifications appear/disappear
- [ ] Hover effects don't lag

---

## ♿ Accessibility Testing

- [ ] **Keyboard Navigation**
  - [ ] Tab through all interactive elements
  - [ ] Enter key activates buttons
  - [ ] ESC closes modal
  - [ ] Focus visible

- [ ] **Screen Readers**
  - [ ] Buttons have descriptive labels
  - [ ] Form inputs have labels
  - [ ] Progress updates announced
  - [ ] Icons have alt text (if applicable)

- [ ] **Color Contrast**
  - [ ] Text readable on backgrounds
  - [ ] Links distinguishable
  - [ ] Error states clear

---

## 🔗 Integration Testing

### LoreVault Page

- [ ] OnboardingProgress card appears after role selection
- [ ] Card positioned correctly in layout
- [ ] "Start Onboarding" button triggers modal
- [ ] Modal closes return to LoreVault
- [ ] Achievement awards on completion

### ScrollViewer Page

- [ ] CLICommandGenerator appears for supported scrolls
- [ ] Generator hidden for unsupported scrolls
- [ ] Generator positioned above scroll content
- [ ] Does not break markdown rendering

### DreamMover Page

- [ ] CLI banner displays
- [ ] "View CLI Guide" link works
- [ ] Link navigates to /lore
- [ ] Banner styled consistently

---

## 💾 Data Persistence Testing

- [ ] **LocalStorage**
  - [ ] Progress saves per role
  - [ ] Achievements save globally
  - [ ] Data survives page refresh
  - [ ] Reset clears correct data
  - [ ] No data conflicts between roles

- [ ] **Edge Cases**
  - [ ] Works in private/incognito mode
  - [ ] Handles localStorage full error
  - [ ] Handles corrupt data gracefully
  - [ ] Migrates old data formats (if applicable)

---

## 🌐 Cross-Browser Testing

- [ ] **Chrome** (latest)
  - [ ] All features work
  - [ ] No console errors

- [ ] **Firefox** (latest)
  - [ ] All features work
  - [ ] No console errors

- [ ] **Safari** (latest)
  - [ ] All features work
  - [ ] No console errors

- [ ] **Edge** (latest)
  - [ ] All features work
  - [ ] No console errors

---

## ⚡ Performance Testing

- [ ] **Load Times**
  - [ ] Modal opens instantly (<100ms)
  - [ ] Progress card renders fast
  - [ ] Command generator responsive

- [ ] **Memory Usage**
  - [ ] No memory leaks on repeated use
  - [ ] LocalStorage size reasonable (<1MB)

- [ ] **Interactions**
  - [ ] Button clicks responsive
  - [ ] Form typing smooth
  - [ ] No UI freezing

---

## 🐛 Error Handling

- [ ] **Missing Data**
  - [ ] Handles missing scroll references
  - [ ] Handles missing command templates
  - [ ] Shows fallback content

- [ ] **Network Issues**
  - [ ] Handles failed scroll loads
  - [ ] Shows error messages

- [ ] **User Errors**
  - [ ] Validates required fields
  - [ ] Shows helpful error messages
  - [ ] Prevents invalid submissions

---

## 🔒 Security Testing

- [ ] **XSS Prevention**
  - [ ] User inputs sanitized
  - [ ] No executable code in generated commands

- [ ] **Data Privacy**
  - [ ] LocalStorage data not sensitive
  - [ ] No API keys or passwords stored

---

## 📊 Analytics Testing

- [ ] **Event Tracking** (if implemented)
  - [ ] Onboarding starts tracked
  - [ ] Step completions tracked
  - [ ] Achievement unlocks tracked
  - [ ] Command generations tracked

---

## 🚀 Pre-Deployment Checklist

- [ ] All QA items passed
- [ ] No console errors in production build
- [ ] Documentation complete
- [ ] User guide published
- [ ] Support team trained
- [ ] Rollback plan ready

---

## 📝 Bug Report Template

```
**Title:** [Component] Brief description

**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Browser/Device:**
Chrome 120 / Windows 11

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Paste any errors]
```

---

## ✅ Sign-Off

- [ ] **QA Lead** - All tests passed
- [ ] **Product Manager** - Features meet requirements
- [ ] **Engineering Lead** - Code reviewed and approved
- [ ] **Design Lead** - UI/UX approved

---

**Status:** Ready for production deployment 🚀
