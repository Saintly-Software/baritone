# baritone

A whitelabel-first React design system, published as a set of packages from this
pnpm workspace.

| Package                                                      | What it is                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| [`@saintly-software/baritone`](packages/baritone)            | Core components, theme contract, tokens and recipes            |
| [`@saintly-software/baritone-datatable`](packages/datatable) | `DataTable`, built on TanStack Table                           |
| [`@saintly-software/baritone-form`](packages/form)           | TanStack Form bindings for the core form controls              |
| [`apps/storybook`](apps/storybook) (private)                 | Storybook for every package, plus the interaction-test project |

Start with the [core package README](packages/baritone/README.md) for the
concepts (intents, saliencies, theming). Contributor rules live in
[`AGENTS.md`](AGENTS.md).

## Layout

```
packages/<name>/        one published package each
  src/                  sources, colocated stories and unit tests
  vite.config.ts        library build → dist/
  vitest.config.ts      unit-test project (jsdom)
apps/storybook/         Storybook config and the Storybook Vitest project
tests/                  repo-wide convention tests that scan every package
.config/                shared tsconfig, lint/format config and Vite/Vitest helpers
```

Packages import each other by name (`@saintly-software/baritone`). Inside the
workspace that name resolves to the sibling's `src/` through the
`@saintly-software/source` export condition, so dev, tests, typecheck and
Storybook need no prior build. Library builds skip that condition and compile
against the sibling's `dist/`, which is why `pnpm build` builds the core first.

Code that sibling packages need but applications shouldn't use goes in the
core's `@saintly-software/baritone/internal` entry. It carries no semver
guarantee; the packages are versioned in lockstep so that's safe.

## Scripts

```sh
pnpm build            # build every package (core first) into packages/*/dist
pnpm typecheck        # tsc --noEmit in every package, plus tests/
pnpm test             # unit + convention tests, then Storybook interaction tests
pnpm storybook        # run Storybook for all packages on :6006
pnpm changeset        # add a changeset (semver + changelog)
```

Run one package's scripts with a filter, e.g.
`pnpm --filter @saintly-software/baritone-datatable test`.
