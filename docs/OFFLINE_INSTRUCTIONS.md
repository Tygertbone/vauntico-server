# OFFLINE WORKFLOW INSTRUCTIONS

## When internet goes off at 5am:

### 1. DEV SERVER WILL KEEP RUNNING

The server doesn't need internet once started.
Just keep this terminal open: http://localhost:3001

### 2. TO MAKE CHANGES WITHOUT ME:

All component files are in:

- src/components/mystical/VaultOpening.jsx (main animation)
- src/components/mystical/VaultOpeningCTA.jsx (wrapper)
- src/pages/WorkshopKit.jsx (integration)

### 3. IF YOU GET SYNTAX ERRORS:

Open the file in any text editor (VS Code, Notepad++)
Look for lines with {variableName} - they need backticks:
BAD: 'rgba(255, 0, 0, {opacity})'
GOOD: \
gba(255, 0, 0, \)\

### 4. TO TEST CHANGES:

1. Save the file
2. Vite will auto-reload (watch the terminal)
3. Refresh browser

### 5. COMMON FIXES:

- Template literals need backticks: \ ext \\
- Missing 'r' in rgba: gba -> rgba
- Line breaks in function calls - put on one line

### 6. IF SERVER CRASHES:

npm run dev

### 7. TO RESTART FRESH:

Stop server (Ctrl+C)
npm run dev

## FILES YOU CAN EDIT:

? src/components/mystical/VaultOpening.jsx - Main animation
? tailwind.config.js - Animation keyframes
? src/pages/WorkshopKit.jsx - Where it's integrated

## BACKUP FILES (if you break something):

- src/components/mystical/VaultOpening.v3.backup
- src/components/mystical/VaultOpeningCTA.jsx.backup
- tailwind.config.js.backup2

## TO RESTORE BACKUP:

Copy-Item 'src/components/mystical/VaultOpening.v3.backup' 'src/components/mystical/VaultOpening.jsx' -Force

Good luck! ??
