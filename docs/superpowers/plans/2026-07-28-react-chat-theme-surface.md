# React Chat Theme Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Chat V2 reuse Chat V1's classic and pearl-white backgrounds, and add a small standalone light/dark preview toggle without connecting business features.

**Architecture:** Chat V2 imports the existing shared UI tokens, fonts, reset, and theme overrides rather than maintaining a second palette. A dedicated `ThemeToggle` owns only the switch presentation and emits a `UiTheme`; `ChatApp` keeps the preview theme in local React state and applies it through the existing `data-ui-theme` contract.

**Tech Stack:** React 19, TypeScript, shared CSS custom properties, Lucide React, Vitest, Vite.

## Global Constraints

- Reuse `src/renderer/ui/tokens.css` and `src/renderer/ui/theme.css`; do not duplicate Chat V1 color literals.
- Support exactly `classic` and `pearl-white`.
- Do not connect settings persistence, chat runtime, sidebar behavior, or Work/Chat behavior in this change.
- Do not add a new UI or animation dependency.
- Preserve the current uncommitted React migration work.

---

### Task 1: Reuse the shared Chat V1 theme surface

**Files:**
- Modify: `src/renderer/chat-react/main.tsx`
- Modify: `src/renderer/chat-react/index.html`
- Modify: `src/renderer/chat-react/styles/tokens.css`
- Modify: `src/renderer/chat-react/styles/components.css`
- Modify: `src/renderer/chat-react/components/ChatApp.tsx`

**Interfaces:**
- Consumes: shared `--rb-*` custom properties and the `data-ui-theme="classic" | "pearl-white"` selector contract.
- Produces: `.chat-v2-shell`, whose classic background matches Chat V1 and whose pearl-white background uses the existing shared light surface.

- [x] **Step 1: Add shared stylesheet imports**

Import `../ui/tokens.css`, `../ui/fonts.css`, `../ui/base.css`, and `../ui/theme.css` from `chat-react/main.tsx`. Remove the obsolete `data-theme` attribute and direct stylesheet links from `chat-react/index.html`.

- [x] **Step 2: Convert React-only tokens to compatibility aliases**

Keep only semantic aliases that the current React skeleton consumes:

```css
:root {
  --rb-accent: var(--rb-pink-400);
  --rb-divider: var(--rb-border-soft);
  --rb-divider-soft: var(--rb-border-faint);
  --rb-glass-bg: rgba(255, 255, 255, 0.07);
  --rb-glass-bg-hover: rgba(255, 255, 255, 0.12);
  --rb-danger: var(--rb-pink-400);
  --rb-danger-hover: var(--rb-pink-500);
}
```

Add pearl-white overrides only for the two glass aliases so the existing skeleton remains legible.

- [x] **Step 3: Add the Chat V1 background recipe**

Add `.chat-v2-shell` with the same three radial gradients, base linear gradient, border, and restrained inset/glow treatment used by `.chat` in Chat V1. Add a pearl-white selector that switches to `var(--rb-card-bg)` and the shared light border/shadow values.

- [x] **Step 4: Apply the shell class and shared theme attribute**

Replace the React root's inline solid background with `className="chat-v2-shell"`. Keep `UiTheme` in local state and assign `document.documentElement.dataset.uiTheme = theme` whenever the local preview changes.

- [x] **Step 5: Build to verify stylesheet resolution**

Run:

```powershell
npm run build:renderer
```

Expected: Vite exits with code 0 and emits `dist/renderer/chat-react/index.html`.

### Task 2: Add the standalone light/dark toggle

**Files:**
- Create: `src/renderer/chat-react/components/ThemeToggle.tsx`
- Modify: `src/renderer/chat-react/components/TitleBar.tsx`
- Modify: `src/renderer/chat-react/styles/components.css`

**Interfaces:**
- Consumes: `value: UiTheme`, `onChange: (theme: UiTheme) => void`.
- Produces: `ThemeToggle`, an accessible switch that previews the opposite theme locally.

- [x] **Step 1: Implement the component**

Create a native button with `role="switch"`, `aria-checked={value === "pearl-white"}`, a descriptive `aria-label`, Lucide `Moon` and `Sun` icons, and a decorative thumb. On click, emit `"pearl-white"` when current value is `"classic"` and `"classic"` otherwise.

- [x] **Step 2: Style immediate and reduced-motion feedback**

Style a compact pill track, move the thumb with `transform`, use `:active` for immediate press feedback, and add visible focus treatment. Under `prefers-reduced-motion: reduce`, remove thumb travel animation while preserving the state change.

- [x] **Step 3: Place it in the temporary title-bar slot**

Replace the existing single theme icon button in `TitleBar` with `ThemeToggle`; leave all window controls unchanged.

- [x] **Step 4: Run focused and renderer verification**

Run:

```powershell
npm run build:renderer
npm test -- --run src/main/ui-theme.test.ts
```

Expected: both commands exit with code 0.

- [x] **Step 5: Visually inspect both states**

Open the Chat V2 preview, toggle once, and verify the classic background matches Chat V1's pink-violet depth while pearl-white uses the shared white surface. Confirm the title-bar switch remains readable in both states and does not overlap window controls.
