---
"@saintly-software/baritone": minor
---

Add a `LinkProvider` to wire `Link` to your app's router once, for the whole tree.

Previously every router-driven `Link` needed its own `render`
(`render={<NextLink href="…" />}`). `LinkProvider` hoists that to the app root:
wrap your tree once and every _internal_ `Link` — inline or `appearance="button"` —
renders through your router's link, keeping the system's styling while the router
owns client-side navigation.

```tsx
import Link from "next/link";

<LinkProvider render={(props) => <Link {...props} />}>
  <App />
</LinkProvider>;

// …no per-link render needed:
<Link href="/dashboard">Dashboard</Link>;
```

- **Router-agnostic.** The provider's `render` receives the resolved link props
  (`href`, `className`, `children`, …); map `href` onto whatever prop your router
  uses — `href` for Next.js, `to` for React Router / TanStack Router
  (`render={({ href, ...props }) => <RouterLink to={href} {...props} />}`).
- **Safe to wrap everything.** Only _internal_ links route; external URLs
  (`https:`, `mailto:`, `tel:`, …), new-tab (`target`), and `download` links stay
  plain anchors. The internal test is `isInternalHref` (exported) — purely
  syntactic, so it's SSR-safe — overridable via the provider's `isInternal` prop.
- **Escape hatch preserved.** A per-link `render` still wins over the provider,
  and a `Link` outside any provider behaves exactly as before.
- Exposes `useLinkRender` for building your own router-aware link-like components
  (the same hook `Link` uses).
