# Project navigation follow-up

We now route client workspaces through the new sidebar layout. Admin parity will require a similar treatment. Recommended order of work:

1. **Admin router swap** – replace `AdminProjectPage` usage in `main.tsx` with `AdminProjectLayout`, mirroring the business route nesting so features stay in sync.
2. **Shared admin pages** – create admin-specific counterparts for schedule, backlog, delivery, and ops when the workflows diverge (for example, backlog needs editing controls). If differences are light, reuse the client components but gate editing affordances behind the layout `mode`.
3. **Shared data hooks** – move project mutations (create story, schedule meeting, etc.) into hooks that can be consumed by nested admin routes rather than the monolithic page.
4. **Stage tooling** – once routes are split, retire the stage-gated rendering inside `AdminProjectPage` and convert those components into the new routes (e.g., Requirements = overview, Planning = backlog editing tools, etc.).

Blocking issues discovered today:

- Admin router still points at the legacy page, so new views are invisible on that side.
- Admin-only actions (story creation, sprint creation) currently live inside the old page and need extraction before swapping the route.

This plan keeps the analog navigation consistent for both audiences while letting us progressively enhance admin workflows.
