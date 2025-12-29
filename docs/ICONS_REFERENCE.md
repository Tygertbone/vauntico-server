# Icons Reference for New Pages

## Required Lucide React Icons

Both new pages use icons from the lucide-react package. Make sure all imports are available.

### Workshop Page Icons
`jsx
import { CheckCircle2, Sparkles, BookOpen, GitCommit, Shield } from 'lucide-react';
`

- **Sparkles** - Onboarding Rituals, spiritual transformation
- **BookOpen** - JSX Purification, documentation
- **GitCommit** - Lore-Sealing Commit Templates
- **Shield** - Code Review Sanctuary, protection
- **CheckCircle2** - CTA buttons, list items

### Audit Service Page Icons
`jsx
import { CheckCircle2, Shield, Clock, FileSearch, Zap, AlertTriangle, Lock, Activity } from 'lucide-react';
`

- **Shield** - Main security theme, webhook validation
- **Lock** - Replay Protection, encryption
- **FileSearch** - Forensic Logging, audit trails
- **Activity** - Real-Time Monitoring, system health
- **Zap** - Performance Analytics, speed
- **AlertTriangle** - Threat Detection, warnings
- **Clock** - SLA timing guarantees
- **CheckCircle2** - CTA buttons, feature lists

### Sidebar Icons
`jsx
import { Wrench, Shield } from 'lucide-react';
`

- **Wrench** - Workshop page navigation
- **Shield** - Audit Service page navigation

## Icon Usage Pattern

All icons follow this structure:
`jsx
<IconName className=\"w-6 h-6\" />
`

For feature cards, icons are wrapped in a container:
`jsx
<div className=\"bg-vauntico-gold/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-vauntico-gold\">
  <IconName className=\"w-6 h-6\" />
</div>
`

## Color Variants
- Default: 	ext-vauntico-gold
- In containers: Icon inherits color from parent with 	ext-vauntico-gold
- CTA buttons: Icons appear next to text with same color

## Accessibility
All icons used decoratively or with accompanying text. No standalone icons without labels for screen readers.
