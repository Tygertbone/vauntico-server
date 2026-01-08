# 📸 CLI Onboarding System - Visual Demo Guide

**For:** Product demos, documentation, training  
**Created:** 2025-01-26

---

## 🎯 Screenshot Guide

### 1. **Role Selection Screen** (`/lore`)

**What to capture:**
- Three role cards (Solo Creator, Agency, Team Lead)
- Hover state on one card
- Vault access info card at bottom

**Key elements:**
```
✅ Role icons clearly visible (👨‍💻, 🏢, 👥)
✅ "Begin →" buttons visible
✅ Scroll count badges
✅ Gradient colors prominent
```

---

### 2. **Onboarding Progress Card** (After role selection)

**What to capture:**
- Full progress card in different states:
  - 0% (just started)
  - 40% (mid-progress)
  - 100% (completed)
- Expanded view showing achievements

**Key elements:**
```
✅ Progress bar with percentage
✅ Status emoji changes (🌱 → 🌿 → 🌳 → ⚡ → 🏆)
✅ "Start/Continue Onboarding" button
✅ Achievement badges (locked & unlocked)
```

---

### 3. **CLI Onboarding Modal** (Step-by-step flow)

**What to capture:**

#### Step 1: Installation
```
┌─────────────────────────────────────────┐
│ ⚡ Install Dream Mover CLI              │
│                                         │
│ $ npm install -g @vauntico/cli   [📋] │
│                                         │
│ $ vauntico --version                   │
│                                         │
│ ✓ vauntico v2.0.0                      │
│                                         │
│ 📜 Related Scroll: dream-mover-cli     │
│                                         │
│ [← Previous]  [Skip]  [Mark Complete→] │
└─────────────────────────────────────────┘
```

#### Step 2: Authentication
```
┌─────────────────────────────────────────┐
│ 🔐 Authenticate Your Account            │
│                                         │
│ $ vauntico auth login            [📋] │
│                                         │
│ ✓ Authentication successful            │
│                                         │
│ [← Previous]      [Mark Complete →]    │
└─────────────────────────────────────────┘
```

#### Step 5: Completion
```
┌─────────────────────────────────────────┐
│         Achievement Unlocked!           │
│         👑 CLI Master                   │
│                                         │
│   Congratulations! You've completed     │
│         the CLI onboarding              │
│                                         │
│         [🎉 Complete Onboarding]        │
└─────────────────────────────────────────┘
```

**Key elements:**
```
✅ Step navigation dots at top
✅ Progress bar shows current position
✅ Terminal-style code blocks (dark background, green text)
✅ Copy button with "Copied!" feedback
✅ Navigation buttons (Previous, Skip, Complete)
✅ Related scroll links functional
```

---

### 4. **CLI Command Generator** (Embedded in scrolls)

**What to capture:**

#### Selection State
```
┌─────────────────────────────────────────────┐
│ 🎨 CLI Command Generator                    │
│ Content Generation                          │
│                                             │
│ SELECT COMMAND:          CONFIGURE:         │
│ ┌──────────────────┐    ┌────────────────┐│
│ │ ▶ Generate Blog  │    │ Topic:         ││
│ │   Generate Image │    │ [10 tips for] ││
│ │   Save Template  │    │ [productivity] ││
│ └──────────────────┘    │                ││
│                         │ Word Count:    ││
│                         │ [1000 ▼]       ││
│                         │                ││
│                         │ [⚡ Generate]  ││
│                         └────────────────┘│
└─────────────────────────────────────────────┘
```

#### Generated Output
```
┌─────────────────────────────────────────────┐
│ YOUR COMMAND:                          [📋]│
│ $ vauntico generate text \                 │
│   --prompt "10 tips for productivity" \    │
│   --style blog --length 1000               │
│                                             │
│ ✓ Ready to paste into your terminal        │
└─────────────────────────────────────────────┘
```

**Key elements:**
```
✅ Two-column layout (templates | config)
✅ Dynamic form based on selected template
✅ Real-time command generation
✅ Copy button with success state
✅ Pro tips section at bottom
```

---

### 5. **Achievement System** (Expanded progress card)

**What to capture:**
- Grid of 6 achievement badges
- Mix of unlocked (colored) and locked (grayscale) states
- Achievement count indicator

**Visual layout:**
```
┌─────────────────────────────────────────┐
│ 🏆 Achievements                    3/6  │
│                                         │
│ ⚡ CLI Novice        🔐 Authenticated  │
│ Installed CLI       Connected account  │
│                                         │
│ 🎨 Dream Weaver     🔒 (Locked)        │
│ First generation    ???                │
│                                         │
│ 🔒 (Locked)         🔒 (Locked)        │
│ ???                 ???                │
└─────────────────────────────────────────┘
```

**Key elements:**
```
✅ Unlocked badges show icon + title + description
✅ Locked badges show 🔒 and grayed out
✅ Gradient backgrounds for unlocked badges
✅ Count indicator (X / 6)
```

---

### 6. **Mobile Responsive Views**

**What to capture:**
- Onboarding modal on mobile (375px width)
- Progress card on tablet (768px width)
- Command generator stacked layout

**Key elements:**
```
✅ Single column layouts
✅ Touch-friendly button sizes
✅ Scrollable content areas
✅ Readable text at small sizes
```

---

## 🎥 Video Demo Script

### Scene 1: Introduction (0:00 - 0:15)
```
"Welcome to Vauntico's CLI Onboarding System.
Let me show you how we transform command-line complexity
into an intuitive, guided experience."
```

### Scene 2: Role Selection (0:15 - 0:30)
```
"First, users choose their path: Solo Creator, Agency, or Team Lead.
Each role gets a customized onboarding flow with relevant steps."
```

### Scene 3: Progress Tracking (0:30 - 0:45)
```
"The progress card shows real-time completion status.
Watch as the progress bar fills and achievements unlock."
```

### Scene 4: Step-by-Step Flow (0:45 - 1:15)
```
"Let's walk through the onboarding steps.
Each step includes:
- Clear instructions
- Copy-paste commands
- Verification steps
- Links to detailed documentation

Users can navigate freely between completed steps."
```

### Scene 5: Command Generator (1:15 - 1:40)
```
"Inside our documentation scrolls, users find the Command Generator.
Select a template, fill in the fields, and get a ready-to-use command.
No more syntax errors or documentation hunting."
```

### Scene 6: Achievements (1:40 - 2:00)
```
"Gamification drives completion. Users unlock badges
as they progress through the onboarding journey.
This creates a sense of accomplishment and encourages exploration."
```

### Scene 7: Conclusion (2:00 - 2:15)
```
"The CLI Onboarding System bridges the gap between
documentation and action, making powerful tools accessible to everyone."
```

---

## 📊 A/B Testing Recommendations

### Test 1: Gamification Impact
- **Variant A:** With achievements visible
- **Variant B:** Without achievements
- **Metric:** Completion rate

### Test 2: Step Count
- **Variant A:** 5 steps (current)
- **Variant B:** 3 steps (condensed)
- **Metric:** Drop-off rate per step

### Test 3: Command Generator Placement
- **Variant A:** Embedded in scrolls (current)
- **Variant B:** Floating sidebar widget
- **Metric:** Usage frequency

---

## 🎨 Design Tokens

### Colors Used:
```css
--vault-purple: #7C3AED
--vault-blue: #3B82F6
--vault-cyan: #06B6D4
--success-green: #10B981
--warning-orange: #F59E0B
```

### Typography:
```css
--font-heading: 'Inter', sans-serif
--font-body: 'Inter', sans-serif
--font-mono: 'Fira Code', monospace (for code blocks)
```

### Animations:
```css
--fade-in: 300ms ease-in-out
--slide-up: 400ms cubic-bezier(0.4, 0, 0.2, 1)
--scale-hover: transform 200ms ease
```

---

## 📝 Screenshot Checklist

Before taking screenshots:

- [ ] Clear localStorage (fresh state)
- [ ] Use consistent browser window size (1280x720)
- [ ] Disable browser extensions (clean UI)
- [ ] Use high-DPI display (Retina/4K)
- [ ] Ensure good lighting for monitor photos
- [ ] Crop consistently (no excess whitespace)
- [ ] Add annotations/callouts in editing tool
- [ ] Export as PNG (lossless quality)

---

## 🔗 File Naming Convention

```
cli-onboarding-{feature}-{state}-{platform}.png

Examples:
- cli-onboarding-role-selection-default-desktop.png
- cli-onboarding-progress-card-expanded-mobile.png
- cli-onboarding-modal-step1-active-desktop.png
- cli-onboarding-command-gen-generated-desktop.png
- cli-onboarding-achievements-unlocked-tablet.png
```

---

## 📹 Screen Recording Settings

**Recommended Tools:**
- macOS: QuickTime, ScreenFlow
- Windows: OBS Studio, Camtasia
- Web: Loom, ScreenPal

**Settings:**
- Resolution: 1920x1080 (Full HD)
- Frame Rate: 60fps for smooth animations
- Format: MP4 (H.264 codec)
- Audio: Clear voiceover, no background music
- Length: 2-3 minutes max per feature

---

**Created for Vauntico product documentation**  
Last updated: 2025-01-26
