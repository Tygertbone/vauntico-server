# Quick Testing Guide

## ?? Start Development Server

If not already running:
```bash
cd vauntico-mvp/vauntico-mvp
npm run dev
```

## ?? Test URLs

Open these URLs in your browser:

### New Pages
- **Workshop**: http://localhost:5173/workshop
- **Audit Service**: http://localhost:5173/audit-service

### Navigation Testing
- **Homepage**: http://localhost:5173/
  - Look for "Sacred Workshop" and "Audit Service" cards
- **Via Sidebar**: 
  - Click "Workshop" in left sidebar
  - Click "Audit Service" in left sidebar

## ? Visual Checklist

### Workshop Page
- [ ] Hero section loads with gold text
- [ ] Pricing shows R499
- [ ] 4 feature cards display with icons
- [ ] 3-step process section visible
- [ ] Testimonial card renders
- [ ] CTA buttons are clickable
- [ ] Hover effects work on cards
- [ ] Mobile responsive (resize browser)

### Audit Service Page
- [ ] Hero section with animated background
- [ ] Pricing shows R999/month
- [ ] 6 security feature cards
- [ ] 4 SLA guarantee cards
- [ ] Code snippet displays correctly
- [ ] 3 use case cards
- [ ] Testimonial visible
- [ ] CTA buttons functional
- [ ] Responsive layout works

## ?? Navigation Testing

### From Homepage
1. Scroll to feature cards grid
2. Click "Sacred Workshop" card ? Should go to /workshop
3. Go back to homepage
4. Click "Audit Service" card ? Should go to /audit-service

### From Sidebar
1. Click "Workshop" in sidebar ? Should navigate to /workshop
2. Click "Audit Service" in sidebar ? Should navigate to /audit-service
3. Click other links to verify navigation works

### CTA Testing
1. On Workshop page, click "Book Your Workshop" ? Goes to /vault-success
2. Click "See Examples" ? Goes to /demo
3. On Audit page, click "Start Free Trial" ? Goes to /vault-success
4. Click "View Dashboard Demo" ? Goes to /demo

## ?? Responsive Testing

### Desktop (> 1024px)
- Feature grids show 3 columns
- All spacing looks balanced
- Hover effects smooth

### Tablet (768px - 1024px)
- Grids adjust to 2 columns
- Buttons remain clickable
- Text remains readable

### Mobile (< 768px)
- Single column layouts
- Text scales appropriately
- Sidebar converts to mobile sheet
- CTAs stack vertically

## ?? Design Verification

### Colors
- Background should be black
- Cards should be gray-900
- Text should be white/gray-300
- Accents should be Vauntico gold (#D4AF37)
- Borders should have gold tint

### Icons
- All Lucide icons should render
- Icons should have gold color
- Icons should be properly sized (w-6 h-6)

### Animations
- Hero sections fade in
- Cards have hover effects
- Buttons scale on hover
- Transitions are smooth

## ?? Common Issues & Fixes

### Icons not showing
`ash
# Verify lucide-react is installed
cd vauntico-mvp/vauntico-mvp
npm list lucide-react

# If missing, install it
npm install lucide-react
`

### Page not found (404)
- Verify dev server is running
- Check App.jsx has the routes
- Clear browser cache
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Styling issues
- Check Tailwind CSS is compiled
- Verify tailwind.config.js has color values
- Restart dev server

### Navigation not working
- Check React Router is installed
- Verify sidebar.jsx has been updated
- Check for console errors in browser DevTools

## ?? Browser DevTools

### Check Console
`
Press F12 ? Console tab
Look for any errors (red text)
`

### Check Network
`
Press F12 ? Network tab
Verify all assets load (status 200)
`

### Check Responsive
`
Press F12 ? Toggle device toolbar (Ctrl+Shift+M)
Test different screen sizes
`

## ? Success Indicators

You should see:
- ? No errors in console
- ? All sections render
- ? Icons display correctly
- ? Hover effects work
- ? Navigation functions
- ? Responsive on mobile
- ? Gold accents throughout
- ? Smooth animations
- ? Dark theme consistent

## ?? Screenshot Checklist

Take screenshots for documentation:
1. Workshop page - Full scroll
2. Audit Service page - Full scroll
3. Homepage with new cards
4. Sidebar with new links
5. Mobile view of both pages

## ?? Performance Check

### Page Load
- Pages should load instantly (already bundled)
- No layout shift on load
- Icons render immediately

### Interactions
- Hover effects should be smooth (60fps)
- Clicks should respond instantly
- No lag on scroll

## ?? Ready for Production?

Before deploying:
- [ ] All visual tests pass
- [ ] Navigation works everywhere
- [ ] Mobile experience is good
- [ ] No console errors
- [ ] CTA links updated (if needed)
- [ ] Analytics tracking added (if needed)
- [ ] Payment integration complete (if needed)

## ?? Notes

Document any issues found:
- Browser: _________
- Issue: _________
- Expected: _________
- Actual: _________

---

**Happy Testing! ??**

If everything looks good, the pages are ready for user testing and feedback.
