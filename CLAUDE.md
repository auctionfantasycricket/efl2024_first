# Auction Fantasy Cricket — Claude Code Guide

## Project Overview
React app for a fantasy cricket auction platform. Uses Bootstrap, MUI, and Antd with a custom dark theme.

---

## Design System & Styling Rules

### The Golden Rule
**Never hardcode colors, font sizes, spacing, or shadows.** Always use the CSS variables defined in `src/index.css` under `:root`.

### CSS Variables (src/index.css)
All design tokens live in `:root` in `src/index.css`. Reference them as `var(--token-name)`.

| Category | Token Examples |
|----------|---------------|
| Backgrounds | `--bg-primary`, `--bg-surface`, `--bg-gradient` |
| Brand Colors | `--color-primary`, `--color-success`, `--color-danger` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted` |
| Borders | `--border-color`, `--border-radius` |
| Typography | `--font-family`, `--font-size-md`, `--font-size-sm` |
| Spacing | `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl` |
| Shadows | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Transitions | `--transition` (0.3s ease-in-out) |

### Do's
- Use `var(--bg-gradient)` for page section backgrounds
- Use `var(--bg-surface)` / `var(--bg-surface-hover)` for card/table row backgrounds
- Use `var(--color-primary)` for buttons and interactive elements
- Use `var(--text-secondary)` (`#B8B8B8`) for secondary/muted text
- Use `var(--border-radius)` (10px) as standard; `--border-radius-sm` (8px) for inputs
- Use `var(--transition)` for all hover/focus transitions
- Use `var(--font-family)` — the custom Centra font loaded in App.css

### Don'ts
- Never use `lightgray`, `lightpink`, `lightsalmon`, `lightcoral` — these break the dark theme
- Never use `rgb(197, 109, 2)` (the old orange offcanvas color) — use `--bg-gradient` instead
- Never inline hardcoded hex colors like `color: "#fff"` — use `color: var(--text-primary)`
- Never mix pixel and rem font sizes arbitrarily — use the `--font-size-*` scale
- Never override MUI/Antd components with raw CSS when a theme config would be cleaner

### Dark Theme Palette
The site uses a **dark theme**. All new components must be dark-theme compatible:
- Page background: `#121212` (`--bg-primary`)
- Card/surface: `rgba(255, 255, 255, 0.05)` (`--bg-surface`)
- Section gradient: `linear-gradient(90.21deg, rgba(21, 18, 97, 0.5) -5.91%, rgba(0, 34, 81, 0.5) 111.58%)` (`--bg-gradient`)

### Auction Button States
Use the defined gradient variables for team bid buttons:
- Idle: `var(--btn-gradient-idle)` (blue)
- Hover: `var(--btn-gradient-hover)` (orange/red)
- Selected: `var(--btn-gradient-selected)` (green)
- Disabled: `var(--btn-gradient-disabled)` (gray)

### Typography Scale
| Token | Value | Use for |
|-------|-------|---------|
| `--font-size-xl` | 2.5rem | Page titles (h1) |
| `--font-size-lg` | 1.5rem | Section headings |
| `--font-size-md` | 1rem | Body text |
| `--font-size-sm` | 0.875rem | Labels, captions |
| `--font-size-xs` | 0.75rem | Footer, tiny text |

### Spacing Scale
Use `--spacing-sm` (8px), `--spacing-md` (16px), `--spacing-lg` (24px), `--spacing-xl` (60px) for padding/margin. Do not invent arbitrary values.

---

## Tech Stack
- React (CRA)
- Bootstrap 5 (layout, navbar)
- MUI (`@mui/material`) — tables, buttons, inputs
- Antd — modals, selects, cards
- `styled-components` installed but not used — prefer CSS files
- Firebase (backend/auth)
- Redux Toolkit (state)
- React Query (data fetching)

## CSS File Structure
- `src/index.css` — **design tokens (CSS variables), body font**
- `src/App.css` — font-face declarations, global resets
- `src/components/*.css` — component-scoped styles
- `src/pages/*.css` — page-scoped styles

## Running Locally
```bash
npm install
npm start
```
App runs at `http://localhost:3000`
