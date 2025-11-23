## Styles and Theming

### Tailwind Configuration

- Config file: `frontend/tailwind.config.js`.
- Key customizations:
  - **Color palettes**:
    - `ink`: grayscale for text and surfaces.
    - `electric`: primary brand blue.
    - `emerald`: success/positive state.
    - `amber`: warning/attention state.
  - **Semantic colors** exposed via `brand`, `surface`, `border`, `text`, `accent`, `success`, `warning`, and `danger` keys.
  - **Typography**: custom `fontFamily` for `sans` and `display` using Space Grotesk and Work Sans.
  - **Sizing**: extra spacing, radius, shadows, and animations for cards and transitions.

### Global Styles

- File: `frontend/src/index.css`.
- Responsibilities:
  - Imports Google Fonts for Space Grotesk and Work Sans.
  - Applies `@tailwind base`, `components`, and `utilities`.
  - Defines CSS variables on `:root` for surfaces, borders, text colors, and brand gradients.
  - Provides a dark-mode variant via `@media (prefers-color-scheme: dark)` that swaps surface and text tokens.
  - Sets overall page background using layered gradients for a subtle, modern look.

### Utility Classes

- Defined under `@layer components` in `index.css`:
  - **`page-shell`**: base page background and text color.
  - **`grid-shell`**: max-width container with responsive horizontal padding.
  - **`surface-card`**: elevated card styling with complex shadows and highlights.
  - **`surface-panel`**: lower-depth panel styling for secondary surfaces.
  - **`surface-sprint`**: high-emphasis surface for sprint boards and key delivery panels.
  - **`glass`**: glassmorphism effect (blurred background, translucent border).
  - **`tag`, `tag-soft`, `tag-muted`**: pill-shaped badges for status labels.
  - **`btn-primary`, `btn-secondary`**: button styles used across headers and pages.
  - **`empty-state`**: standardized empty-state blocks.
  - **`skeleton`**: shimmering placeholder for loading states.

### Visual Language

- **Colors by Status/Stage**

  - Brand blue (`brand`, `electric`) for primary actions and active states.
  - Emerald for success (e.g., done/approved states), amber for warnings or upcoming actions, and red (`danger`) for destructive or error states.
  - Stages and statuses often appear as tags/badges with subtle background and strong text.

- **Layout**

  - Centered `grid-shell` layouts with generous padding.
  - Cards and panels use rounded corners (`rounded-2xl` / `rounded-3xl`) and layered surfaces for depth.
  - Sprint views (`surface-sprint`) emphasize the active work area.

- **Responsiveness**
  - Tailwind breakpoints (`sm`, `md`, `lg`) are used across layouts to adjust grid columns, padding, and typography.
  - Navigation and cards stack vertically on small screens and expand horizontally on larger ones.

### Adding New Styles and Components

- Prefer Tailwind utility classes for layout and spacing.
- When a visual pattern repeats (e.g., a recurring card/panel look), either:
  - Wrap it with a reusable component (like `Card`, `PageHeader`, `StatTile`), or
  - Introduce a new utility class under `@layer components` in `index.css`.
- Keep new colors aligned with the existing palette:
  - Extend `tailwind.config.js` for truly new color families.
  - Or reuse semantic tokens (`brand`, `success`, `warning`, `danger`) for stateful UI.

## Frontend Styles and Theming

### Tailwind configuration

- Tailwind is configured in `frontend/tailwind.config.js` with:
  - Custom color palettes (`ink`, `electric`, `emerald`, `amber`).
  - Semantic color aliases:
    - `brand` (primary blue) with `brand.subtle`, `brand.strong`.
    - `surface` and `surface.alt/raised/soft` for backgrounds.
    - `border.subtle/muted/bold` and `text.primary/muted/faint`.
    - `success`, `warning`, `danger` for status messaging.
  - Extended typography, spacing, border radii, shadows, and animations.
  - Content scanning covers `index.html` and all files under `src/**/*.{js,ts,jsx,tsx}`.

### Global styles and CSS variables

- Global CSS lives in `frontend/src/index.css`.
- Defines CSS custom properties for surfaces, text colors, brand colors, and card/sprint surfaces under `:root`.
- Supports a dark mode variant via `@media (prefers-color-scheme: dark)`, which remaps surface and text variables.
- Applies app‑wide background gradients to `body` for a subtle, branded look.
- Provides utility classes via `@layer components`:
  - Layout helpers: `page-shell`, `grid-shell`.
  - Surfaces: `surface-card`, `surface-panel`, `surface-sprint` for layered cards/panels.
  - UI patterns: `stat-tile`, `glass`, `tag`, `tag-soft`, `tag-muted`, `btn-primary`, `btn-secondary`, `empty-state`, `skeleton`.

### Visual language

- **Colors by status/stage:**

  - Brand blue (`brand`) is used for primary actions and active navigation.
  - Success/emerald for positive outcomes, warning/amber for at‑risk, and danger red for blocking issues.
  - Stages and statuses (projects, sprints, stories) are styled using consistent badges and tag colors derived from these palettes.

- **Layout approach:**

  - `SiteLayout` and `WorkspaceChrome` use `grid-shell` to constrain content width and maintain consistent gutters.
  - Cards and panels leverage `surface-card` / `surface-panel` for depth, with subtle shadows and gradients.
  - Workspace pages use `WorkspaceChrome`’s rail/bar navigation to create clear, app‑like workspaces for business and admin users.

- **Responsiveness:**
  - Tailwind breakpoints and responsive classes (`sm:`, `md:`, `lg:`) are used extensively in layout components.
  - `WorkspaceChrome` switches between a top bar nav and side rail depending on viewport size.

### Adding new styles/components

- Prefer Tailwind utility classes combined with existing semantic components (`Card`, `PageHeader`, `FormSection`, `Modal`) rather than ad‑hoc CSS.
- When new visual patterns are repeated across the app:
  - Add small, semantic utility classes to `index.css` under `@layer components`.
  - Reuse existing CSS variables for colors and surfaces instead of hard‑coding hex values.
- Ensure new components:
  - Respect the app’s spacing scale and typography.
  - Work in both light and dark preferred color schemes by relying on the defined CSS variables.
