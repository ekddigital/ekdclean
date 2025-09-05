

# Full UI design & scan flow (CleanMyMac-style) — rewritten

CleanMyMac-style apps are simple, trustworthy, macOS-native utilities that guide users through **scan → review → clean** while protecting user data and giving a strong sense of control and safety.

## 1 — High-level summary

* Single friendly dashboard with a dominant scanning CTA.
* Quick scan = fast, safe, limited-scope; Full/Advanced scan = deeper, slower, may require permissions.
* Review stage groups results by category with recommended auto-selections.
* Final Clean stage shows confirmation + recoverability (undo / quarantine).

## 2 — Main screens & information architecture

* **Header / App chrome**: app title, system free space, last scan timestamp.
* **Primary navigation** (sidebar or top tabs): Dashboard (Smart/Quick Scan), Cleanup (System Junk), Uninstaller, Extensions, Large & Old Files, Maintenance, Privacy, Settings.
* **Main content area**: module content, grouped results, preview pane.
* **Footer / Action Bar**: live “Selected: X items — Y GB” and primary action (“Clean”).

## 3 — Visual language & layout

* macOS-like spacing, rounded cards, soft shadows; system font (SF).
* Prominent primary CTA (big round or rectangular button).
* Summary cards for reclaimed space, health score, last scan.
* Lists grouped into collapsible ResultGroup cards with checkboxes and previews.

## 4 — Result groups & review screen

* Group row: icon, title, size, count, recommended badge, short explanatory copy.
* Expand to see individual items (path, size, preview).
* “Select recommended” per group; live total updates.

## 5 — Key components & behaviors

* **Smart/Quick Scan CTA** (dominant).
* **Progress UI** (staged: Scanning → Analyzing → Ready to Review).
* **Preview pane** with file paths and thumbnails.
* **Confirmation modal** for destructive actions.
* **Quarantine / Undo** entry visible after cleaning.
* **Permission flow**: explicit, guided, and visible.

## 6 — Interaction & microinteractions

* Subtle animations for scan progress and success.
* Immediate updates to size counter when toggling items.
* Smooth transitions for expand/collapse and removals.
* Clear error/permission states with action buttons.

## 7 — Copy & tone

* Calm and explanatory. Avoid alarmist language.
* Use exact sizes and file paths. Buttons: “Smart Scan”, “Clean”, “More details”, “Undo”.

## 8 — Safety & recoverability

* Preview before delete; recommended selections flagged; Undo + quarantine; audit log/report of removed items.

## 9 — Accessibility & i18n

* Tab/keyboard flows, ARIA labels, scalable fonts, localized strings (keep file paths separate from translatable sentences).

## 10 — Onboarding

* One-screen tour explaining Quick vs Full scan, permission needs, and what’s not touched by default.

## 11 — Implementation notes

* ResultGroup component, lazy-load items on expand, background workers for scanning, IPC (Electron) for long-running scans, selection state aggregated per group.

## 12 — Quick checklist

* Dashboard, sidebar, progress UI, grouped results, previews, batch selection & live size counter, confirm modals, undo/quarantine, permission guides, accessibility + i18n.

## 13 — What quick scans usually exclude (important)

Commonly excluded locations (explain these to users; optionally include in Full scan):

* `~/Documents` (user-created files)
* `~/Desktop`
* `~/Pictures`, Photo Library bundles (`Photos Library.photoslibrary`)
* `~/Library/Mail` and mailboxes
* iCloud-synced folders / cloud drive roots
* Time Machine snapshots and APFS local snapshots
* System-level directories (`/System`, `/usr/bin`, `/Library/System/Library`)
* Encrypted/password-protected volumes
* Browser/profile databases, Messages DB, Photos DB (database-backed stores)
* External drives & network volumes
* Hidden deep caches requiring Full Disk Access

**UI patterns for exclusions:** show a “Quick scan excludes” banner, an Advanced/Full-scan toggle, per-location toggles in settings, and a clear permission interstitial when the user opts into full scans.

---

# Deep dive: Circular Scan Button + Progress Spinner (design + implementation)

You described a circular scanning button that also shows progress as a circular ring “from one end to the other” — essentially a progress ring that visually reads as a single elegant control: a big central CTA surrounded by an animated circular progress indicator (with a nicely rounded arc, gradient, and smooth motion). Below I’ll cover design, motion, states, accessibility, and concrete implementation approaches.

## 1 — Visual specification (how it should look)

* **Shape:** circular button (diameter 96–140px on desktop). Central primary label/icon (e.g., magnifying glass / radar / play).
* **Ring:** thick stroke (6–12px) around the button showing progress as a filled arc. Use `stroke-linecap: round` for smooth rounded ends.
* **Gradient:** subtle linear or conic gradient along the ring (e.g., start: #4F8CF7 → #7BE6B6) to create depth.
* **Background:** optional two-layer approach: subtle halo/blur behind the ring for glow.
* **States:** Idle (no progress), Indeterminate scanning (looping sweep), Determinate scanning (progress arc grows clockwise from a start angle), Paused, Completed (full ring + success check) and Error (red ring + X icon).
* **Center CTA:** label text underneath or inside — “Smart Scan” on idle; “Pause” during scanning; show time/percent optional.
* **Microcopy:** small status line below: “Scanning — 1 of 6 modules” or “2.1 GB found”.

## 2 — Motion design & microinteractions

* **Idle → Start:** subtle scale up (1.0 → 1.03) and ring fade-in.
* **Indeterminate phase:** an arc (20–30% of circumference) rotates around the circle (gives motion while analysis stage runs). This is used when total progress is unknown.
* **Determinate phase:** animate `stroke-dashoffset` (or `stroke-dasharray`) to reveal arc from start angle clockwise; ease with `cubic-bezier(0.22,1,0.36,1)` for a pleasing curve.
* **Progress step change:** animate to new progress value smoothly rather than snapping.
* **Complete:** ring fills fully and a success check appears with a short burst animation (scale up + fade).
* **Hover / Focus:** raise elevation (box-shadow) and show focus ring (for keyboard accessibility).

## 3 — Accessibility & keyboard

* **Role & ARIA:** `role="button"`, `aria-pressed` or `aria-busy` depending on state, `aria-label` (e.g., “Start Smart Scan, currently idle”).
* **Keyboard:** Enter/Space triggers action; Escape pauses/cancels.
* **Screen reader:** provide live region updates with progress percent: `aria-live="polite"` update: “Scan 45% complete — analyzing caches.”
* **Contrast:** ensure ring colors meet contrast ratios against background or provide outer halo.

## 4 — Implementation approaches (ranked by control & quality)

### A. SVG + stroke-dasharray (best control & crisp visuals)

* Draw a `<circle>` with radius `r`. Circumference `C = 2πr`.
* Use `stroke-dasharray: C` and animate `stroke-dashoffset` from `C` → `C * (1 - progress)` (or reverse depending on orientation).
* To get rounded ends: `stroke-linecap="round"`.
* To set start angle: rotate the `<svg>` or wrap in a `<g transform="rotate(-90, cx, cy)">` to start at top.
* Apply gradient via `<defs><linearGradient>` or use `stroke="url(#grad)"`.
* Animate using CSS transitions for progress with JS updates (smooth), or Framer Motion for springy smoothing.

### B. Conic-gradient + mask (pure CSS and fast)

* Use a conic-gradient for the ring on a pseudo-element and mask a donut shape with `mask` / `-webkit-mask`.
* Control progress by setting the degree of the gradient `conic-gradient(var(--accent) 0deg calc(var(--deg) * 1deg), transparent 0deg)`.
* Best for simpler builds but less control for rounded stroke caps; use pseudo-element for endpoints or overlay an SVG cap.

### C. Canvas rendering (for very fancy effects)

* Use `requestAnimationFrame` to draw an arc and animate endpoints with sub-pixel effects, blur, glow. More work, but high performance for advanced effects.

### D. Use a prebuilt component/library (fast)

* **react-circular-progressbar** — easy determinate progress; supports customizing stroke width & styles.
* **lottie-react** — if you want a fully crafted animation created in After Effects / Lottie (great for complex sequences like scan → success).
* **framer-motion** / **react-spring** — animate values and mount/unmount animations, useful for smooth stroke-dashoffset transitions.
* **Aceternity UI / shadcn/ui** — component libraries to provide base buttons and styles; you’ll still implement the circular ring yourself or wrap a provided “button” in a custom SVG ring.

## 5 — Electron-specific notes (how UI gets progress numbers)

* **Architecture:** run scanning tasks in the Electron main process (or a child worker) and send progress to renderer via `ipcMain`/`ipcRenderer` or `contextBridge` (`preload`) channels.
* **Pattern:** `scan:start` → main creates worker → emits `scan:progress` events with `{module, percent, foundSize}` → renderer updates SVG progress.
* **Safety:** scanning reads file system; keep it off the renderer and use preload scripts to expose safe APIs only. Avoid enabling `nodeIntegration`.

---

# Concrete React + Tailwind component (production-ready pattern)

Below is a careful, copy-pastable React (TypeScript) component using SVG + Framer Motion for smooth transitions. It deliberately avoids Node/Electron APIs — it expects the parent to provide `progress` updates (0..1) and state. You can adapt this to Electron by hooking progress from IPC events.

> Save as `CircularScanButton.tsx`. Requires `framer-motion` and Tailwind. If you use shadcn/ui, you can wrap the exported component inside shadcn `Button` variants.

```tsx
// CircularScanButton.tsx
import React, { useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type ScanState = "idle" | "indeterminate" | "scanning" | "paused" | "done" | "error";

interface Props {
  size?: number; // px
  strokeWidth?: number;
  progress: number; // 0..1, use 0..1 for determinate; for indeterminate use scanning + indeterminate state
  state: ScanState;
  label?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export default function CircularScanButton({
  size = 112,
  strokeWidth = 10,
  progress,
  state,
  label = "Smart Scan",
  onClick,
  ariaLabel,
}: Props) {
  const half = size / 2;
  const radius = useMemo(() => half - strokeWidth / 2, [half, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // Use framer-motion values to smoothly animate dashoffset
  const motionProgress = useMotionValue(progress);
  React.useEffect(() => {
    const controls = animate(motionProgress, progress, {
      type: "spring",
      stiffness: 120,
      damping: 18,
    });
    return controls.stop;
  }, [progress, motionProgress]);

  const dashoffset = useTransform(motionProgress, (p) => {
    // progress 1 => offset 0 (full ring), progress 0 => offset circumference
    return circumference * (1 - Math.max(0, Math.min(1, p)));
  });

  // Colors and variants
  const ringColor = state === "error" ? "#F14B4B" : state === "done" ? "#3BD671" : undefined;

  // Provide accessible label text
  const computedAria = ariaLabel ?? `${label} — ${Math.round(progress * 100)}%`;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        role="button"
        aria-label={computedAria}
        aria-busy={state === "scanning" || state === "indeterminate"}
        onClick={onClick}
        className="relative focus:outline-none"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          aria-hidden
        >
          <defs>
            <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F8CF7" />
              <stop offset="100%" stopColor="#7BE6B6" />
            </linearGradient>
          </defs>

          {/* Background ring (subtle) */}
          <circle
            cx={half}
            cy={half}
            r={radius}
            stroke="#E7E9EE"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress ring (animated via stroke-dashoffset) */}
          <motion.circle
            cx={half}
            cy={half}
            r={radius}
            stroke={ringColor ?? "url(#scanGrad)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${half} ${half})`} // start at 12 o'clock
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashoffset }}
          />

          {/* Indeterminate sweeping arc when unknown */}
          {state === "indeterminate" && (
            <g transform={`rotate(-90 ${half} ${half})`}>
              <motion.path
                d={describeArcPath(half, half, radius, 0, 60)}
                stroke="url(#scanGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                style={{ rotate: 0, originX: half, originY: half }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 1.4 }}
              />
            </g>
          )}
        </svg>

        {/* Center button content */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: "translateZ(0)",
          }}
        >
          <div
            className="flex flex-col items-center justify-center select-none"
            style={{
              width: size - strokeWidth * 2.2,
              height: size - strokeWidth * 2.2,
              borderRadius: "9999px",
              background:
                state === "done"
                  ? "rgba(59,214,113,0.08)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(246,247,250,0.85))",
              boxShadow: "var(--scan-btn-shadow, 0 6px 18px rgba(15,23,42,0.08))",
            }}
          >
            {/* Icon / label */}
            <div className="flex items-center justify-center flex-col">
              {state === "done" ? (
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-9.192 9.2-4.1-4.116a1 1 0 0 0-1.414 1.413l4.9 4.915a1 1 0 0 0 1.414 0z"
                    fill="#0f172a"
                  />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="#0f172a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="5"
                    stroke="#0f172a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}

              <span className="mt-1 text-xs text-slate-700">{label}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Small status line */}
      <div className="text-xs text-slate-500" aria-hidden>
        {state === "scanning" || state === "indeterminate"
          ? `Scanning — ${Math.round(progress * 100)}%`
          : state === "done"
          ? "Scan complete"
          : state === "idle"
          ? "Ready to scan"
          : state === "error"
          ? "Scan failed"
          : "Paused"}
      </div>
    </div>
  );
}

/**
 * Utility to create an SVG arc path (used for indeterminate sweep)
 * Returns a path string for an arc from startAngle to endAngle (degrees)
 */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}
function describeArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
```

### Notes about the component

* It uses SVG + `strokeDashoffset` to animate determinate progress (smooth via Framer Motion).
* The indeterminate state uses an animated arc path that rotates continuously.
* The SVG is rotated `-90°` so the progress starts at 12 o’clock. Change rotation to pick another start angle.
* `stroke-linecap: round` gives the smooth rounded end.
* The `linearGradient` gives a two-color gradient around the arc — for a conic-like feel, you can create multi-stop gradients or use filter/glow for a richer look.
* Swap or extend the center content to show pause/play icons or a percentage readout.

---

# Library suggestions & how to combine them

## UI libraries / component systems

* **shadcn/ui** — Tailwind-driven primitives you can copy and extend. Use it for consistent Button styles, modals, and form controls. You’ll still create the custom SVG ring inside a `Button` wrapper. (Works well in React + Electron.)
* **Aceternity UI (Aceternity/Aceternity UI)** — an animation-forward library built on Tailwind + Framer Motion; good for landing components and eye-candy. Use selectively (not necessarily for core system behavior). We found this as “Aceternity UI” (likely what you meant by “arcenity”).
* **Radix UI** (unmentioned earlier) — low-level accessible primitives (dialogs, popovers) you can style with Tailwind/shadcn. Good for accessibility-correct modals like permission flows.

## Animation & progress libs

* **Framer Motion** — best-in-class for smooth animations, springs, layout transitions. Pairs perfectly with SVG stroke-dashoffset animations.
* **react-spring** — alternative for physics-based animations.
* **react-circular-progressbar** — quick determinate progress circle with text support. Simple and mature.
* **lottie-react** + After Effects/Lottie animations — for a highly polished scan → success sequence built by a motion designer. Use if you want a single-file complex animation.

## Electron integration

* Keep scanning & FS I/O in the main process or a worker. Expose a safe `window.api.scan` or similar from preload to avoid enabling nodeIntegration. Example flow:

  * Renderer: `window.api.scanStart()`
  * Main: starts worker, emits `scan:progress` events (percent, moduleName, addedSize).
  * Renderer subscribes: `window.api.onScanProgress((payload) => setProgress(payload.percent))`.

## Styling & theme integration

* If you use **shadcn/ui**, create a `ScanButton` wrapper that takes the library's `Button` styles but replaces the children with the circular SVG. This maintains consistent spacing and states.
* If you use **Aceternity UI**, you can borrow motion patterns and copy/paste animated effects for splash/hover states.

---

# Implementation & engineering checklist (practical)

* [ ] Create `ScanController` service in main process / worker to handle scanning modules.
* [ ] Use IPC (preload `contextBridge`) to stream `{percent, module, step}` events to renderer.
* [ ] Implement `CircularScanButton` in renderer and connect to live progress.
* [ ] Add indeterminate mode while specific module analysis runs (no % yet).
* [ ] Implement confirmation modals for destructive actions with `Radix` or shadcn modal.
* [ ] Provide permission-guided flows (Full Disk Access instructions) in UI as step-by-step screens.
* [ ] Implement Undo / Quarantine: keep removed items in sandboxed trash and offer restore UI.
* [ ] Test keyboard navigation and screen reader messages (`aria-live`) for progress updates.
* [ ] Add unit/integration tests for progress events handling and button states.

---

# Example UX states & transitions (summary)

* **Idle** → user clicks → **Indeterminate** (quick analysis) or **Determinate** (if main progress known) → **Scanning** → **Complete** (ring full + success) → show Undo toast.
* Pause/resume toggles scanning worker. Clicking when scanning should reveal Pause/Cancel options.

---

# Final tips & next steps

* If you want, I can:

  * convert the `CircularScanButton` to plain JS (no TS) or adapt it to your framework if you’re using Preact/Vue.
  * produce a Lottie animation suggestion (what keyframes to include).
  * produce a tiny Electron preload + main process snippet showing `ipcMain` / `ipcRenderer` wiring for scan progress.
  * output a small style system that matches shadcn UI tokens for consistent visuals.





# Full UI design & scan flow (CleanMyMac-style) — rewritten

CleanMyMac-style apps are simple, trustworthy, macOS-native utilities that guide users through **scan → review → clean** while protecting user data and giving a strong sense of control and safety.

## 1 — High-level summary

* Single friendly dashboard with a dominant scanning CTA.
* Quick scan = fast, safe, limited-scope; Full/Advanced scan = deeper, slower, may require permissions.
* Review stage groups results by category with recommended auto-selections.
* Final Clean stage shows confirmation + recoverability (undo / quarantine).

## 2 — Main screens & information architecture

* **Header / App chrome**: app title, system free space, last scan timestamp.
* **Primary navigation** (sidebar or top tabs): Dashboard (Smart/Quick Scan), Cleanup (System Junk), Uninstaller, Extensions, Large & Old Files, Maintenance, Privacy, Settings.
* **Main content area**: module content, grouped results, preview pane.
* **Footer / Action Bar**: live “Selected: X items — Y GB” and primary action (“Clean”).

## 3 — Visual language & layout

* macOS-like spacing, rounded cards, soft shadows; system font (SF).
* Prominent primary CTA (big round or rectangular button).
* Summary cards for reclaimed space, health score, last scan.
* Lists grouped into collapsible ResultGroup cards with checkboxes and previews.

## 4 — Result groups & review screen

* Group row: icon, title, size, count, recommended badge, short explanatory copy.
* Expand to see individual items (path, size, preview).
* “Select recommended” per group; live total updates.

## 5 — Key components & behaviors

* **Smart/Quick Scan CTA** (dominant).
* **Progress UI** (staged: Scanning → Analyzing → Ready to Review).
* **Preview pane** with file paths and thumbnails.
* **Confirmation modal** for destructive actions.
* **Quarantine / Undo** entry visible after cleaning.
* **Permission flow**: explicit, guided, and visible.

## 6 — Interaction & microinteractions

* Subtle animations for scan progress and success.
* Immediate updates to size counter when toggling items.
* Smooth transitions for expand/collapse and removals.
* Clear error/permission states with action buttons.

## 7 — Copy & tone

* Calm and explanatory. Avoid alarmist language.
* Use exact sizes and file paths. Buttons: “Smart Scan”, “Clean”, “More details”, “Undo”.

## 8 — Safety & recoverability

* Preview before delete; recommended selections flagged; Undo + quarantine; audit log/report of removed items.

## 9 — Accessibility & i18n

* Tab/keyboard flows, ARIA labels, scalable fonts, localized strings (keep file paths separate from translatable sentences).

## 10 — Onboarding

* One-screen tour explaining Quick vs Full scan, permission needs, and what’s not touched by default.

## 11 — Implementation notes

* ResultGroup component, lazy-load items on expand, background workers for scanning, IPC (Electron) for long-running scans, selection state aggregated per group.

## 12 — Quick checklist

* Dashboard, sidebar, progress UI, grouped results, previews, batch selection & live size counter, confirm modals, undo/quarantine, permission guides, accessibility + i18n.

## 13 — What quick scans usually exclude (important)

Commonly excluded locations (explain these to users; optionally include in Full scan):

* `~/Documents` (user-created files)
* `~/Desktop`
* `~/Pictures`, Photo Library bundles (`Photos Library.photoslibrary`)
* `~/Library/Mail` and mailboxes
* iCloud-synced folders / cloud drive roots
* Time Machine snapshots and APFS local snapshots
* System-level directories (`/System`, `/usr/bin`, `/Library/System/Library`)
* Encrypted/password-protected volumes
* Browser/profile databases, Messages DB, Photos DB (database-backed stores)
* External drives & network volumes
* Hidden deep caches requiring Full Disk Access

**UI patterns for exclusions:** show a “Quick scan excludes” banner, an Advanced/Full-scan toggle, per-location toggles in settings, and a clear permission interstitial when the user opts into full scans.

---

# Deep dive: Circular Scan Button + Progress Spinner (design + implementation)

You described a circular scanning button that also shows progress as a circular ring “from one end to the other” — essentially a progress ring that visually reads as a single elegant control: a big central CTA surrounded by an animated circular progress indicator (with a nicely rounded arc, gradient, and smooth motion). Below I’ll cover design, motion, states, accessibility, and concrete implementation approaches.

## 1 — Visual specification (how it should look)

* **Shape:** circular button (diameter 96–140px on desktop). Central primary label/icon (e.g., magnifying glass / radar / play).
* **Ring:** thick stroke (6–12px) around the button showing progress as a filled arc. Use `stroke-linecap: round` for smooth rounded ends.
* **Gradient:** subtle linear or conic gradient along the ring (e.g., start: #4F8CF7 → #7BE6B6) to create depth.
* **Background:** optional two-layer approach: subtle halo/blur behind the ring for glow.
* **States:** Idle (no progress), Indeterminate scanning (looping sweep), Determinate scanning (progress arc grows clockwise from a start angle), Paused, Completed (full ring + success check) and Error (red ring + X icon).
* **Center CTA:** label text underneath or inside — “Smart Scan” on idle; “Pause” during scanning; show time/percent optional.
* **Microcopy:** small status line below: “Scanning — 1 of 6 modules” or “2.1 GB found”.

## 2 — Motion design & microinteractions

* **Idle → Start:** subtle scale up (1.0 → 1.03) and ring fade-in.
* **Indeterminate phase:** an arc (20–30% of circumference) rotates around the circle (gives motion while analysis stage runs). This is used when total progress is unknown.
* **Determinate phase:** animate `stroke-dashoffset` (or `stroke-dasharray`) to reveal arc from start angle clockwise; ease with `cubic-bezier(0.22,1,0.36,1)` for a pleasing curve.
* **Progress step change:** animate to new progress value smoothly rather than snapping.
* **Complete:** ring fills fully and a success check appears with a short burst animation (scale up + fade).
* **Hover / Focus:** raise elevation (box-shadow) and show focus ring (for keyboard accessibility).

## 3 — Accessibility & keyboard

* **Role & ARIA:** `role="button"`, `aria-pressed` or `aria-busy` depending on state, `aria-label` (e.g., “Start Smart Scan, currently idle”).
* **Keyboard:** Enter/Space triggers action; Escape pauses/cancels.
* **Screen reader:** provide live region updates with progress percent: `aria-live="polite"` update: “Scan 45% complete — analyzing caches.”
* **Contrast:** ensure ring colors meet contrast ratios against background or provide outer halo.

## 4 — Implementation approaches (ranked by control & quality)

### A. SVG + stroke-dasharray (best control & crisp visuals)

* Draw a `<circle>` with radius `r`. Circumference `C = 2πr`.
* Use `stroke-dasharray: C` and animate `stroke-dashoffset` from `C` → `C * (1 - progress)` (or reverse depending on orientation).
* To get rounded ends: `stroke-linecap="round"`.
* To set start angle: rotate the `<svg>` or wrap in a `<g transform="rotate(-90, cx, cy)">` to start at top.
* Apply gradient via `<defs><linearGradient>` or use `stroke="url(#grad)"`.
* Animate using CSS transitions for progress with JS updates (smooth), or Framer Motion for springy smoothing.

### B. Conic-gradient + mask (pure CSS and fast)

* Use a conic-gradient for the ring on a pseudo-element and mask a donut shape with `mask` / `-webkit-mask`.
* Control progress by setting the degree of the gradient `conic-gradient(var(--accent) 0deg calc(var(--deg) * 1deg), transparent 0deg)`.
* Best for simpler builds but less control for rounded stroke caps; use pseudo-element for endpoints or overlay an SVG cap.

### C. Canvas rendering (for very fancy effects)

* Use `requestAnimationFrame` to draw an arc and animate endpoints with sub-pixel effects, blur, glow. More work, but high performance for advanced effects.

### D. Use a prebuilt component/library (fast)

* **react-circular-progressbar** — easy determinate progress; supports customizing stroke width & styles.
* **lottie-react** — if you want a fully crafted animation created in After Effects / Lottie (great for complex sequences like scan → success).
* **framer-motion** / **react-spring** — animate values and mount/unmount animations, useful for smooth stroke-dashoffset transitions.
* **Aceternity UI / shadcn/ui** — component libraries to provide base buttons and styles; you’ll still implement the circular ring yourself or wrap a provided “button” in a custom SVG ring.

## 5 — Electron-specific notes (how UI gets progress numbers)

* **Architecture:** run scanning tasks in the Electron main process (or a child worker) and send progress to renderer via `ipcMain`/`ipcRenderer` or `contextBridge` (`preload`) channels.
* **Pattern:** `scan:start` → main creates worker → emits `scan:progress` events with `{module, percent, foundSize}` → renderer updates SVG progress.
* **Safety:** scanning reads file system; keep it off the renderer and use preload scripts to expose safe APIs only. Avoid enabling `nodeIntegration`.

---

# Concrete React + Tailwind component (production-ready pattern)

Below is a careful, copy-pastable React (TypeScript) component using SVG + Framer Motion for smooth transitions. It deliberately avoids Node/Electron APIs — it expects the parent to provide `progress` updates (0..1) and state. You can adapt this to Electron by hooking progress from IPC events.

> Save as `CircularScanButton.tsx`. Requires `framer-motion` and Tailwind. If you use shadcn/ui, you can wrap the exported component inside shadcn `Button` variants.

```tsx
// CircularScanButton.tsx
import React, { useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type ScanState = "idle" | "indeterminate" | "scanning" | "paused" | "done" | "error";

interface Props {
  size?: number; // px
  strokeWidth?: number;
  progress: number; // 0..1, use 0..1 for determinate; for indeterminate use scanning + indeterminate state
  state: ScanState;
  label?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export default function CircularScanButton({
  size = 112,
  strokeWidth = 10,
  progress,
  state,
  label = "Smart Scan",
  onClick,
  ariaLabel,
}: Props) {
  const half = size / 2;
  const radius = useMemo(() => half - strokeWidth / 2, [half, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // Use framer-motion values to smoothly animate dashoffset
  const motionProgress = useMotionValue(progress);
  React.useEffect(() => {
    const controls = animate(motionProgress, progress, {
      type: "spring",
      stiffness: 120,
      damping: 18,
    });
    return controls.stop;
  }, [progress, motionProgress]);

  const dashoffset = useTransform(motionProgress, (p) => {
    // progress 1 => offset 0 (full ring), progress 0 => offset circumference
    return circumference * (1 - Math.max(0, Math.min(1, p)));
  });

  // Colors and variants
  const ringColor = state === "error" ? "#F14B4B" : state === "done" ? "#3BD671" : undefined;

  // Provide accessible label text
  const computedAria = ariaLabel ?? `${label} — ${Math.round(progress * 100)}%`;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        role="button"
        aria-label={computedAria}
        aria-busy={state === "scanning" || state === "indeterminate"}
        onClick={onClick}
        className="relative focus:outline-none"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          aria-hidden
        >
          <defs>
            <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F8CF7" />
              <stop offset="100%" stopColor="#7BE6B6" />
            </linearGradient>
          </defs>

          {/* Background ring (subtle) */}
          <circle
            cx={half}
            cy={half}
            r={radius}
            stroke="#E7E9EE"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress ring (animated via stroke-dashoffset) */}
          <motion.circle
            cx={half}
            cy={half}
            r={radius}
            stroke={ringColor ?? "url(#scanGrad)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${half} ${half})`} // start at 12 o'clock
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashoffset }}
          />

          {/* Indeterminate sweeping arc when unknown */}
          {state === "indeterminate" && (
            <g transform={`rotate(-90 ${half} ${half})`}>
              <motion.path
                d={describeArcPath(half, half, radius, 0, 60)}
                stroke="url(#scanGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                style={{ rotate: 0, originX: half, originY: half }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 1.4 }}
              />
            </g>
          )}
        </svg>

        {/* Center button content */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: "translateZ(0)",
          }}
        >
          <div
            className="flex flex-col items-center justify-center select-none"
            style={{
              width: size - strokeWidth * 2.2,
              height: size - strokeWidth * 2.2,
              borderRadius: "9999px",
              background:
                state === "done"
                  ? "rgba(59,214,113,0.08)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(246,247,250,0.85))",
              boxShadow: "var(--scan-btn-shadow, 0 6px 18px rgba(15,23,42,0.08))",
            }}
          >
            {/* Icon / label */}
            <div className="flex items-center justify-center flex-col">
              {state === "done" ? (
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-9.192 9.2-4.1-4.116a1 1 0 0 0-1.414 1.413l4.9 4.915a1 1 0 0 0 1.414 0z"
                    fill="#0f172a"
                  />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="#0f172a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="5"
                    stroke="#0f172a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}

              <span className="mt-1 text-xs text-slate-700">{label}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Small status line */}
      <div className="text-xs text-slate-500" aria-hidden>
        {state === "scanning" || state === "indeterminate"
          ? `Scanning — ${Math.round(progress * 100)}%`
          : state === "done"
          ? "Scan complete"
          : state === "idle"
          ? "Ready to scan"
          : state === "error"
          ? "Scan failed"
          : "Paused"}
      </div>
    </div>
  );
}

/**
 * Utility to create an SVG arc path (used for indeterminate sweep)
 * Returns a path string for an arc from startAngle to endAngle (degrees)
 */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}
function describeArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
```

### Notes about the component

* It uses SVG + `strokeDashoffset` to animate determinate progress (smooth via Framer Motion).
* The indeterminate state uses an animated arc path that rotates continuously.
* The SVG is rotated `-90°` so the progress starts at 12 o’clock. Change rotation to pick another start angle.
* `stroke-linecap: round` gives the smooth rounded end.
* The `linearGradient` gives a two-color gradient around the arc — for a conic-like feel, you can create multi-stop gradients or use filter/glow for a richer look.
* Swap or extend the center content to show pause/play icons or a percentage readout.

---

# Library suggestions & how to combine them

## UI libraries / component systems

* **shadcn/ui** — Tailwind-driven primitives you can copy and extend. Use it for consistent Button styles, modals, and form controls. You’ll still create the custom SVG ring inside a `Button` wrapper. (Works well in React + Electron.)
* **Aceternity UI (Aceternity/Aceternity UI)** — an animation-forward library built on Tailwind + Framer Motion; good for landing components and eye-candy. Use selectively (not necessarily for core system behavior). We found this as “Aceternity UI” (likely what you meant by “arcenity”).
* **Radix UI** (unmentioned earlier) — low-level accessible primitives (dialogs, popovers) you can style with Tailwind/shadcn. Good for accessibility-correct modals like permission flows.

## Animation & progress libs

* **Framer Motion** — best-in-class for smooth animations, springs, layout transitions. Pairs perfectly with SVG stroke-dashoffset animations.
* **react-spring** — alternative for physics-based animations.
* **react-circular-progressbar** — quick determinate progress circle with text support. Simple and mature.
* **lottie-react** + After Effects/Lottie animations — for a highly polished scan → success sequence built by a motion designer. Use if you want a single-file complex animation.

## Electron integration

* Keep scanning & FS I/O in the main process or a worker. Expose a safe `window.api.scan` or similar from preload to avoid enabling nodeIntegration. Example flow:

  * Renderer: `window.api.scanStart()`
  * Main: starts worker, emits `scan:progress` events (percent, moduleName, addedSize).
  * Renderer subscribes: `window.api.onScanProgress((payload) => setProgress(payload.percent))`.

## Styling & theme integration

* If you use **shadcn/ui**, create a `ScanButton` wrapper that takes the library's `Button` styles but replaces the children with the circular SVG. This maintains consistent spacing and states.
* If you use **Aceternity UI**, you can borrow motion patterns and copy/paste animated effects for splash/hover states.

---

# Implementation & engineering checklist (practical)

* [ ] Create `ScanController` service in main process / worker to handle scanning modules.
* [ ] Use IPC (preload `contextBridge`) to stream `{percent, module, step}` events to renderer.
* [ ] Implement `CircularScanButton` in renderer and connect to live progress.
* [ ] Add indeterminate mode while specific module analysis runs (no % yet).
* [ ] Implement confirmation modals for destructive actions with `Radix` or shadcn modal.
* [ ] Provide permission-guided flows (Full Disk Access instructions) in UI as step-by-step screens.
* [ ] Implement Undo / Quarantine: keep removed items in sandboxed trash and offer restore UI.
* [ ] Test keyboard navigation and screen reader messages (`aria-live`) for progress updates.
* [ ] Add unit/integration tests for progress events handling and button states.

---

# Example UX states & transitions (summary)

* **Idle** → user clicks → **Indeterminate** (quick analysis) or **Determinate** (if main progress known) → **Scanning** → **Complete** (ring full + success) → show Undo toast.
* Pause/resume toggles scanning worker. Clicking when scanning should reveal Pause/Cancel options.

---

# Final tips & next steps

* If you want, I can:

  * convert the `CircularScanButton` to plain JS (no TS) or adapt it to your framework if you’re using Preact/Vue.
  * produce a Lottie animation suggestion (what keyframes to include).
  * produce a tiny Electron preload + main process snippet showing `ipcMain` / `ipcRenderer` wiring for scan progress.
  * output a small style system that matches shadcn UI tokens for consistent visuals.

Which follow-up would you like now — the Electron IPC snippet, a Lottie animation plan, or a shadcn-wrapped Button example?



# ✔ CleanMyMac-style UI — Full rewrite (with checkboxes for tracking)

Below is a complete, reorganized design + implementation spec for a CleanMyMac-style cleaning app — rewritten and **every major section** has a checkbox so you and your team can tick items off as you complete them. Use this as product docs, hand-off to designers/devs, or copy into a project tracker.

---

# 1. High-level summary

* [ ] **High-level summary:** CleanMyMac-style UIs are macOS-native, simple and trustworthy. They guide the user through **Scan → Review → Clean** with safe defaults, previews, and undo/quarantine.

---

# 2. Information architecture & main screens

* [ ] **Global chrome / header** — app title, free space, last scan, primary CTA.
* [ ] **Primary navigation** (sidebar or top tabs):

  * [ ] Dashboard / Smart Scan
  * [ ] Cleanup (System Junk)
  * [ ] Uninstaller (apps + leftovers)
  * [ ] Extensions (startup & browser)
  * [ ] Large & Old Files
  * [ ] Maintenance / Optimization
  * [ ] Privacy / Protection
  * [ ] Settings / Preferences
* [ ] **Main content area** — module detail, grouped results, preview pane.
* [ ] **Footer / action bar** — live “Selected: X items — Y GB”, primary action (“Clean”).

---

# 3. Visual language & layout

* [ ] **macOS native aesthetic** — SF/system font, roomy spacing, rounded cards.
* [ ] **Primary CTA** — large, prominent (circular or pill).
* [ ] **Summary cards** — reclaimed space, health score, last scan.
* [ ] **Grouped results** — collapsible cards or two-column lists with preview.
* [ ] **Progressive disclosure** — show top offenders and “Show all”.

---

# 4. Result grouping & review screen

* [ ] **Group row** — icon, title, count, size, recommended badge.
* [ ] **Short explanation** per group (why safe / impact).
* [ ] **Expand for details** — file paths, thumbnails, preview.
* [ ] **Per-group recommended toggle + select all**.
* [ ] **Separate section** for results from excluded locations (user files).

---

# 5. Key components & behaviors

* [ ] **Smart / Quick Scan CTA** — primary action.
* [ ] **Progress UI** — stages: Scanning → Analyzing → Ready.
* [ ] **ResultGroup component** (checkbox, expand, preview).
* [ ] **Preview pane / modal** for file details.
* [ ] **Confirmation modal** for destructive removals.
* [ ] **Quarantine / Undo** area + toast with Undo.
* [ ] **Permissions interstitial** when requesting Full Disk Access.

---

# 6. Interaction & microinteractions

* [ ] **Animated scan button** (subtle scale on press / glow).
* [ ] **Smooth progress animation** (stroke-dashoffset or conic).
* [ ] **Live update** of selected size on checkbox toggle.
* [ ] **Item removal animation** (slide/fade) + success micro-animation.
* [ ] **Error and permission states** with actionable steps.

---

# 7. Copy, microcopy & tone

* [ ] **Calm, explanatory tone** (no alarm).
* [ ] **Explicit info**: sizes, sample paths.
* [ ] **Button labels**: “Smart Scan”, “Clean”, “More details”, “Undo”.
* [ ] **Group descriptions**: one-line explanation under each heading.

---

# 8. Safety, recovery & trust signals

* [ ] **Preview examples** before delete.
* [ ] **Recommended selections** clearly labeled.
* [ ] **Undo / Quarantine** (recover within X days).
* [ ] **Audit log / report** of removed items.
* [ ] **Step-by-step permission guidance** (Full Disk Access, etc.).

---

# 9. Accessibility & internationalization

* [ ] **Keyboard navigation** (tab order, Enter/Space to act).
* [ ] **ARIA labels** for groups, buttons, and progress (`aria-live` updates).
* [ ] **High contrast / scalable fonts** support.
* [ ] **Keep file paths separate from translatable text** for i18n.

---

# 10. Onboarding & first-run experience

* [ ] **One-screen tour**: what’s cleaned, what’s excluded, why permissions needed.
* [ ] **Default Smart/Quick Scan** for immediate, low-risk wins.
* [ ] **Advanced scan opt-in** with tradeoff explanation.

---

# 11. Implementation notes (architecture & components)

* [ ] **ResultGroup**: props `id, title, icon, size, recommended, items[]`.
* [ ] **Selection state**: keep selections per-group, derive totals.
* [ ] **Lazy loading** for long lists (load items on expand).
* [ ] **Scanning worker**: run heavy I/O in worker/main process (Electron).
* [ ] **IPC**: stream progress/events to renderer via `contextBridge` / `ipcRenderer`.
* [ ] **Permission checks**: detect missing access and surface guided flows.

---

# 12. Quick project checklist (copyable, tick as you go)

* [ ] Dashboard & CTA implemented
* [ ] Sidebar & modules wired
* [ ] Scan worker + IPC streaming events
* [ ] Circular Scan Button with progress ring
* [ ] Group results UI + previews
* [ ] Batch selection + live size counter
* [ ] Confirmation modals + permission guides
* [ ] Quarantine + undo system
* [ ] Accessibility & i18n tests
* [ ] Audit logs & reports
* [ ] Unit/integration tests for scanning flows

---

# 13. NEW — Excluded locations (what quick scans usually skip)

> Quick scans intentionally avoid user-sensitive or slow-to-scan places. Surface these exclusions to users and make them opt-in for deeper scans.

* [ ] `~/Documents` — user docs (dangerous to auto-delete)
* [ ] `~/Desktop` — working files often stored here
* [ ] `~/Pictures` & `Photos Library.photoslibrary` — user media, database bundles
* [ ] `~/Library/Mail` — mailboxes & attachments
* [ ] iCloud / cloud-sync roots — synced deletions propagate
* [ ] Time Machine / APFS snapshots — system backups (do not remove by default)
* [ ] `/System`, `/usr/bin`, `/sbin`, `/Library` — system-critical dirs (require admin)
* [ ] Encrypted or password-protected volumes
* [ ] DB-backed stores (Photos DB, Messages DB, Mail DB) — need careful handling
* [ ] External drives & network volumes — excluded by default
* [ ] Hidden deep caches requiring Full Disk Access

**UI patterns for exclusions**

* [ ] Banner on dashboard: “Quick scan excludes Documents, Photos, Mail, iCloud, external drives.”
* [ ] Advanced / Full scan toggle (with permission tradeoffs).
* [ ] Per-location toggles in Settings (include/exclude Desktop, Documents, external drives).
* [ ] Separate “User files” result bucket that requires manual confirmation.

---

# 14. Circular Scan Button + Progress Spinner — full detail (design + implementation + checklist)

This is the core visual/interaction you asked for. I split it into design, motion, accessibility, implementation options, Electron wiring and an implementation checklist.

### 14.1 Visual specification

* [ ] **Diameter:** 96–140 px on desktop (choose per layout).
* [ ] **Stroke thickness:** 6–12 px for the ring.
* [ ] **Rounded stroke ends:** `stroke-linecap: round`.
* [ ] **Gradient ring:** subtle two-stop gradient for depth.
* [ ] **Center content:** icon (magnifier/radar) + small label (“Smart Scan”).
* [ ] **States:** Idle, Indeterminate (sweeping arc), Determinate (progress arc), Paused, Done (full ring + check), Error (red).
* [ ] **Optional:** halo/glow behind ring for emphasis.

### 14.2 Motion & microinteractions

* [ ] Idle → Start: subtle scale up + ring fade in.
* [ ] Indeterminate: rotating sweep arc (20–30% circumference) for unknown progress.
* [ ] Determinate: animate stroke-dashoffset to reveal arc smoothly.
* [ ] Completion: full ring + success check with pop animation.
* [ ] Hover/Focus: elevation and focus ring for accessibility.

### 14.3 Accessibility

* [ ] `role="button"` and `aria-label` describing action + state.
* [ ] `aria-busy` or `aria-live` region updates for progress (e.g., “Scan 45% complete”).
* [ ] Keyboard: Enter/Space to toggle start/pause; Esc to cancel if needed.
* [ ] Sufficient contrast on the ring vs background.

### 14.4 Implementation approaches (choose one)

* [ ] **SVG + stroke-dasharray** — best control and visual crispness. Use `strokeDasharray` = circumference and animate `strokeDashoffset`. Add gradient via `<defs>`. Rotate `-90deg` to start at 12 o’clock.
* [ ] **Conic-gradient + mask (CSS)** — fast, CSS-based. Less control over rounded ends; good for simple visuals.
* [ ] **Canvas** — custom drawing for glow/blur/advanced visuals. More code but very flexible.
* [ ] **Prebuilt libraries** — `react-circular-progressbar` for determinate; `lottie-react` for stylized animation sequences; `framer-motion` for smooth interpolation.

### 14.5 Recommended libraries & combos

* [ ] **Framer Motion** — animate stroke offset and container transitions.
* [ ] **react-circular-progressbar** — quick determinate ring.
* [ ] **lottie-react** — complex scan → success sequences made in After Effects.
* [ ] **shadcn/ui** — style tokens + button wrappers; implement ring inside a shadcn `Button`.
* [ ] **Radix UI** — accessible primitives for dialogs/menus.

### 14.6 Electron wiring (how to feed progress)

* [ ] Keep scanning in main process or worker (no heavy FS in renderer).
* [ ] Expose a safe API via preload `contextBridge` (e.g., `window.api.scanStart()` and `window.api.onScanProgress(cb)`).
* [ ] Worker emits `{percent, moduleName, status}` events; renderer updates `progress` (0..1) which drives the ring.
* [ ] For indeterminate stages, main should emit `{status: 'indeterminate', module: 'X'}`.

### 14.7 Circular scan button checklist (engineering)

* [ ] Implement SVG ring with `strokeDasharray` and `strokeDashoffset` animation.
* [ ] Add indeterminate rotating arc for unknown progress.
* [ ] Hook IPC events to update progress value.
* [ ] Implement keyboard/focus states + `aria-live` updates.
* [ ] Add success + error states with concise micro-animations.
* [ ] Add small status line under button: “Scanning — 45%” or “Ready to scan”.

---

# 15. Engineering & product checklist (final, actionable)

* [ ] Define scan modules (caches, logs, mail caches, large files, apps).
* [ ] Implement scanning worker with modular pipeline (module-per-scan).
* [ ] Implement IPC / `contextBridge` for streaming progress.
* [ ] Build `CircularScanButton` (SVG + Framer Motion).
* [ ] Build ResultGroup UI with preview modal and checkboxes.
* [ ] Build confirm modal + quarantine + undo flow.
* [ ] Build permissions UI and step-by-step guide for Full Disk Access.
* [ ] Implement settings for per-location include/exclude.
* [ ] Add audit log and reporting UI.
* [ ] Accessibility QA & localization.
* [ ] Unit / integration tests and E2E for scanning flows.

---

# 16. Optional follow-ups I can provide now (each has its own checkbox you can tick when requested)

* [ ] **Provide production-ready React + Tailwind `CircularScanButton` component** (SVG + Framer Motion).
* [ ] **Electron IPC example** (preload + main + renderer wiring for scan progress).
* [ ] **Lottie animation plan** (keyframes & sequence outline).
* [ ] **shadcn UI integration example** (wrap circular ring in shadcn `Button`).
* [ ] **ASCII / low-fidelity wireframe** of Dashboard + Review screen with the circular scan button.
  (Reply with which of the above you want and I’ll immediately produce it.)



