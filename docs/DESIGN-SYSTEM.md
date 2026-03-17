# Design system

How colors, type, space, and components are defined and where to change them.

## Tokens: `src/lib/design-tokens.css`

Single source of truth for design primitives and semantic tokens.

- **Primitives** — Raw values: `--dt-neutral-*`, `--dt-orange-*`, `--dt-blue-*`, `--dt-font-sans`, `--dt-space-*`, `--dt-radius-*`, `--dt-duration-*`. Use these only in this file to build semantic tokens.
- **Semantic tokens** — Used in `app.css` and components. Examples:
  - **Surfaces:** `--bg`, `--surface`, `--surface-2`, `--border`, `--border-focus`
  - **Text:** `--text-primary`, `--text-secondary`, `--text-muted`
  - **Brand:** `--orange`, `--orange-hover`, `--orange-button`, `--orange-dim`, `--orange-border`, `--orange-bg`
  - **Coach block:** `--coach-bg`, `--coach-border`, `--coach-text`, `--coach-accent`
  - **Type:** `--font-sans`, `--font-mono`, `--text-xs` … `--text-xxxl`
  - **Space / radius / motion:** e.g. `--dt-space-3`, `--dt-radius-md`, `--dt-duration-normal`

**To change colors or spacing:** edit the primitive or semantic token in `design-tokens.css`; components that use the semantic tokens will update automatically.

## Global styles: `src/app.css`

- Imports `design-tokens.css` first.
- **Base:** Resets, `body` (font, size, background, color).
- **Accessibility:** Skip link (`.skip-link`) and focus styles.
- **Form elements:** Default styles for `input[type="text"]` and `textarea` (background, border, focus).
- **Buttons:** `.btn-primary`, `.btn-secondary` — use these classes for consistent CTAs.

Components in `src/lib/components/` use the same semantic tokens and, where needed, the same button/input styles so the app stays consistent.
