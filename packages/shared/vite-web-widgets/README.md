# vite-web-widgets (prototype)

This workspace package contains shared configuration files for building Mendix pluggable
web widgets with **Vite** (and optionally `rolldown`).

> ⚠️ This is an experimental prototype created on branch `build/update-to-vite`.
> It does **not** currently integrate with `@mendix/pluggable-widgets-tools`, and it
> is not used by any widget yet. The purpose is to have something concrete for
> discussion and review before requesting broader approvals.

## Contents

- `vite.config.ts` – function that returns a baseline Vite config for a widget.
- `benchmark.js` – helper script to compare build time and output size between the
  existing Rollup build and the new Vite build for a given widget.
  To test this locally, pick a widget package and add the following script:

```json
"scripts": {
  "build:vite": "vite build --config ../../shared/vite-web-widgets/vite.config.ts"
}
```

Adjust paths as needed and run `pnpm install` to pull the new dev dependencies.

Once the experiment proves successful, we can either upstream the helpers into
`@mendix/pluggable-widgets-tools` or maintain the new package as the canonical
Vite configuration.
