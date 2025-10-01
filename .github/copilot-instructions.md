# Copilot Instructions for EKD Clean

## Project Overview

**EKD Clean** is a robust cross-platform system optimization tool built by EKD Digital. It's designed to be a superior alternative to CleanMyMac, working seamlessly across Windows, macOS, and Linux with a beautiful, cinematic user interface.

### Core Technology Stack

- **Framework**: Electron 32+ with React 18+ and TypeScript 5.6+
- **Architecture**: Monorepo structure with multiple packages
- **UI Library**: Mantine 7.x with custom EKD theme
- **Animations**: Framer Motion 11.x for smooth, delightful interactions
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand for lightweight, fast state management
- **Icons**: Lucide React for crisp, beautiful iconography
- **Build System**: Vite for fast builds, TypeScript for compilation
- **Node.js**: v22.16.0+ required

### Project Structure

```
ekdclean/
├── .github/              # GitHub configuration and workflows
├── packages/
│   ├── main/            # Electron main process (Node.js backend)
│   ├── renderer/        # React frontend (UI layer)
│   ├── shared/          # Shared types and utilities
│   ├── ui-system/       # EKD Digital design system components
│   ├── animations/      # Framer Motion animation library
│   └── native/          # Native modules for system access
├── docs/                # Project documentation
│   ├── CleanMyMac-Style-Reference.md  # UI/UX design guide
│   └── IMPLEMENTATION_ROADMAP.md      # Feature roadmap
├── assets/              # Icons, animations, and brand assets
└── dist/                # Build output (not committed)
```

## Development Guidelines

### Code Style and Quality

1. **TypeScript First**
   - Use strict TypeScript (`strict: true` in tsconfig.json)
   - Always define proper types and interfaces
   - Avoid `any` types; use `unknown` if type is truly unknown
   - Use path aliases: `@ekd-clean/shared`, `@ekd-clean/ui-system`, etc.

2. **Code Formatting**
   - Use ESLint for linting: `npm run lint`
   - Use Prettier for formatting: `npm run format`
   - Follow existing code style in the repository
   - Keep functions small and focused (single responsibility)

3. **Component Patterns**
   - Functional components with TypeScript interfaces
   - Use React hooks (useState, useEffect, useMemo, useCallback)
   - Prefer composition over inheritance
   - Keep components small and reusable

### Building and Testing

**Development Commands:**
```bash
npm run dev              # Start both main and renderer in watch mode
npm run dev:main         # Start only Electron main process
npm run dev:renderer     # Start only React frontend
npm run build            # Build entire project
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run start            # Start Electron app (after build)
```

**Before Committing:**
- Run `npm run lint` to check for linting issues
- Run `npm run build` to ensure the project builds successfully
- Test changes manually in the Electron app when possible

### Design System and UI/UX

#### Visual Design Principles

1. **CleanMyMac-Style Interface**
   - Clean, minimalist design with soft shadows and rounded corners
   - macOS-native feel with cross-platform adaptability
   - Calm, explanatory tone (no alarmist language)
   - Use exact sizes and file paths for transparency

2. **Color and Typography**
   - Primary: Amber/Orange gradient (from-amber-400 to-orange-500)
   - Background: Gradient (from purple to blue) with glass morphism
   - Typography: System fonts with Inter for UI text
   - High contrast for accessibility

3. **Animation Guidelines**
   - Use Framer Motion for all animations
   - Keep animations smooth and purposeful (60fps minimum)
   - Respect `prefers-reduced-motion` for accessibility
   - Stagger animations for list items (0.1s delay between items)
   - Use `motion.div` with `initial`, `animate`, and `transition` props

#### Component Examples

**Animated Card:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="bg-white/80 rounded-xl p-4 shadow-lg"
>
  {/* content */}
</motion.div>
```

**Button with Gradient:**
```tsx
<button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg">
  Scan Now
</button>
```

### Key UX Principles

1. **Safety and Trust**
   - Preview items before deletion
   - Mark recommended selections clearly
   - Provide undo/quarantine functionality
   - Show detailed audit logs of operations
   - Request permissions explicitly with clear explanations

2. **Information Hierarchy**
   - Large, prominent scan button as primary CTA
   - Group results by category with clear icons
   - Show file sizes, counts, and paths
   - Use status indicators (green for safe, yellow for caution)

3. **Accessibility**
   - Full keyboard navigation support
   - ARIA labels for screen readers
   - High contrast mode support
   - Scalable fonts and responsive layout
   - Live regions for progress updates (`aria-live`)

4. **Onboarding and Guidance**
   - Clear first-run experience
   - Explain Quick vs Full scan differences
   - Guide users through permission requirements
   - Provide contextual help and tooltips

### Cross-Platform Considerations

1. **Platform-Specific Code**
   - Use conditional logic for OS-specific features
   - Abstract platform differences in shared utilities
   - Test on all target platforms (Windows, macOS, Linux)

2. **File Paths**
   - Use platform-agnostic path handling (Node.js `path` module)
   - Separate file paths from translatable text for i18n
   - Handle different path separators correctly

3. **Permissions**
   - Request Full Disk Access on macOS
   - Handle UAC on Windows
   - Use appropriate permissions on Linux

### Security and Privacy

1. **Data Protection**
   - Never collect user data without explicit consent
   - Use sandboxed execution environment
   - Implement encrypted local storage for sensitive data
   - Clear privacy policy and transparency

2. **File Operations**
   - Always confirm destructive operations
   - Implement quarantine before permanent deletion
   - Keep audit logs of all cleaning operations
   - Verify file integrity before operations

### Performance Optimization

1. **Scanning Operations**
   - Use worker threads for heavy I/O operations
   - Stream progress updates via IPC
   - Lazy load large lists (virtualization)
   - Implement cancellation support

2. **UI Responsiveness**
   - Keep UI thread free of blocking operations
   - Use React.memo for expensive components
   - Debounce/throttle frequent updates
   - Optimize re-renders with proper dependency arrays

3. **Memory Management**
   - Clean up event listeners and subscriptions
   - Handle large datasets efficiently
   - Monitor and optimize memory usage

### File Exclusions (Important)

Quick scans should **exclude** these locations by default:

- `~/Documents`, `~/Desktop`, `~/Pictures` (user-created files)
- Photo Library bundles (`Photos Library.photoslibrary`)
- `~/Library/Mail` and mailboxes
- iCloud-synced folders and cloud drive roots
- Time Machine snapshots and APFS local snapshots
- System-level directories (`/System`, `/usr/bin`)
- Browser/profile databases, Messages DB, Photos DB
- External drives and network volumes
- Encrypted/password-protected volumes

**UI Pattern**: Show a banner explaining exclusions with option to enable Full/Advanced scan.

### Common Patterns to Follow

1. **Result Groups**
   - Props: `id`, `title`, `icon`, `size`, `recommended`, `items[]`
   - Expandable/collapsible with checkbox selection
   - Show aggregate size and file count
   - Highlight recommended selections

2. **Progress Indicators**
   - Circular progress ring for scan operations
   - Staged progress: Scanning → Analyzing → Ready to Review
   - Show current module being scanned
   - Display real-time size/count updates

3. **Error Handling**
   - Clear, non-technical error messages
   - Provide actionable recovery steps
   - Use toast notifications for non-critical errors
   - Modal dialogs for critical errors requiring user action

### Documentation

- Document complex algorithms and business logic
- Add JSDoc comments for public APIs
- Keep README files updated in each package
- Update CleanMyMac-Style-Reference.md for UI changes
- Update IMPLEMENTATION_ROADMAP.md as features are completed

### Testing Philosophy

- Write tests for critical business logic
- Test edge cases and error conditions
- Ensure cross-platform compatibility
- Manual testing for UI/UX changes
- Integration tests for IPC communication

## Specific Component Guidelines

### Circular Scan Button

The signature circular scan button should:
- Use SVG circle with `stroke-dasharray` for progress ring
- Animate `stroke-dashoffset` from 100% to 0%
- Support states: Idle, Scanning, Paused, Complete
- Show microcopy below: "Scanning — 1 of 6 modules" or "2.1 GB found"
- Use Framer Motion for smooth transitions
- Implement with proper ARIA labels for accessibility

### Dashboard Layout

- Header with app title, free space indicator, and last scan time
- Dominant central scan button
- Summary cards for reclaimed space and health metrics
- Preview of top result categories (limited to 4 items)
- Footer with live selection counter and "Clean" button

### Review Screen

- Grouped results with expand/collapse
- Individual item selection with checkboxes
- Preview pane for file details
- Live total size/count updates
- Batch selection options ("Select recommended")

## Common Pitfalls to Avoid

1. **Don't** create alarmist or scary UI copy
2. **Don't** delete files without confirmation and preview
3. **Don't** block the UI thread with heavy operations
4. **Don't** use `any` types in TypeScript
5. **Don't** ignore accessibility requirements
6. **Don't** add animations that can't be disabled
7. **Don't** scan user documents without explicit permission
8. **Don't** forget to handle errors gracefully

## Quick Reference

**Import Aliases:**
```typescript
import { type SomeType } from '@ekd-clean/shared/types';
import { Button } from '@ekd-clean/ui-system/components';
import { fadeIn } from '@ekd-clean/animations/variants';
```

**Tailwind Classes for EKD Clean:**
```css
/* Gradient backgrounds */
bg-gradient-to-r from-amber-400 to-orange-500

/* Glass morphism */
bg-white/10 backdrop-blur-md border border-white/20

/* Shadows */
shadow-lg shadow-amber-200/50

/* Rounded corners */
rounded-xl (12px) or rounded-3xl (24px)
```

**Motion Variants:**
```typescript
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};
```

## Resources

- [CleanMyMac Style Reference](../docs/CleanMyMac-Style-Reference.md) - Complete UI/UX guide
- [Implementation Roadmap](../docs/IMPLEMENTATION_ROADMAP.md) - Feature development plan
- [Project Overview](../ekdclean.md) - Vision and architecture

---

**Remember**: EKD Clean aims to be superior to CleanMyMac by being cross-platform, more beautiful, and more transparent. Every feature should prioritize user trust, safety, and delight.
