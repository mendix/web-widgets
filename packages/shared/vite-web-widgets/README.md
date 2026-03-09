# vite-web-widgets (prototype)

This workspace package contains shared configuration files for building Mendix pluggable
web widgets with **Vite** (and optionally `rolldown`).

> ⚠️ This is an experimental prototype created on branch `build/update-to-vite`.
> It does **not** currently integrate with `@mendix/pluggable-widgets-tools`, and it
> is not used by any widget yet. The purpose is to have something concrete for
> discussion and review before requesting broader approvals.

## Contents

- `vite.config.ts` – thin orchestrator and public entrypoint.
- `types.ts` – shared types used by the config/build modules.
- `config/` – config derivation and mode handling.
- `build/` – editor artifact and MPK build steps.
- `helpers/` – package metadata/path helpers.
- `benchmark.js` – helper script to compare build time and output size between the
  existing Rollup build and the new Vite build for a given widget.

## Usage Modes

Both usage patterns are supported and intentionally kept compatible:

- Direct CLI usage (current widget scripts)
- Programmatic usage via `createWidgetViteConfig()`

### Direct CLI Usage

Use this in widget scripts:

```json
"scripts": {
  "build:vite": "vite build --mode dev --config ../../shared/vite-web-widgets/vite.config.ts",
  "release:vite": "vite build --mode prod --config ../../shared/vite-web-widgets/vite.config.ts"
}
```

### Programmatic Usage

Use this if a widget/package wants a local wrapper config:

```ts
import createWidgetViteConfig from "@mendix/vite-web-widgets/vite.config";

export default createWidgetViteConfig();
```

You can optionally override inferred values:

```ts
import createWidgetViteConfig from "@mendix/vite-web-widgets/vite.config";

export default createWidgetViteConfig({
    widgetName: "MyWidget",
    runtimeDirectoryName: "mywidget"
});
```

## Usage: Build Modes

This config supports two build modes via the `--mode` flag:

### Development Mode (`--mode dev`)

Development builds prioritize debugging and quick iteration:

- **Minification:** Disabled
- **Source Maps:** Inline (for debugging)
- **Optimization:** Off (preserves code structure)
- **NODE_ENV:** `"development"`
- **Output Size:** Larger MPK (suitable for local dev and CI)

```json
"scripts": {
  "build:vite": "vite build --mode dev --config ../../shared/vite-web-widgets/vite.config.ts"
}
```

### Production Mode (`--mode prod` or default)

Production builds prioritize size and performance:

- **Minification:** Full (esbuild)
- **Source Maps:** None
- **Optimization:** On (tree-shaking, inlining, etc.)
- **NODE_ENV:** `"production"`
- **Output Size:** Smaller MPK (suitable for releases and marketplace)

```json
"scripts": {
  "release:vite": "vite build --mode prod --config ../../shared/vite-web-widgets/vite.config.ts"
}
```

If no mode is specified, production mode is used by default.

## Internal Module Map

- `vite.config.ts`: public exports and Vite `defineConfig` wiring
- `config/create.ts`: top-level Vite config object creation
- `config/resolve.ts`: resolves widget/runtime config and build mode
- `config/infer.ts`: infers file paths/artifacts/editor entries
- `build/editor-artifacts.ts`: builds editor preview/config outputs
- `build/mpk.ts`: stages files and creates the `.mpk`
- `helpers/package-json.ts`: package.json loading and widget name resolution
- `types.ts`: cross-module type definitions

## Setup Instructions

To test this locally in a widget package, add the following scripts to `package.json`:

```json
"scripts": {
  "build:vite": "vite build --mode dev --config ../../shared/vite-web-widgets/vite.config.ts",
  "release:vite": "vite build --mode prod --config ../../shared/vite-web-widgets/vite.config.ts"
}
```

Adjust paths as needed and run `pnpm install` to pull the new dev dependencies.

Once the experiment proves successful, we can either upstream the helpers into
`@mendix/pluggable-widgets-tools` or maintain the new package as the canonical
Vite configuration.
