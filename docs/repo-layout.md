# Repo layout

## Repo structure overview

This monorepo contains multiple packages of different types.

```
packages/
  pluggableWidgets/   # Mendix pluggable widgets (*-web)
  modules/            # Mendix module packages
  shared/             # Internal shared packages are located here (configs, plugins, utilities)
automation/           # CI/CD tooling, E2E runner, scripts
```

All packages are named after their folder name with `@mendix/` prefix. For example:

- `pluggableWidgets/combobox-web` is `@mendix/combobox-web`
- `modules/data-widgets` is `@mendix/data-widgets`
- `shared/widget-plugin-filtering` is `@mendix/widget-plugin-filtering`

## Working scope

In order to effectively work on specific feature or a bugfix you must focus on:

- Particular package (for example `packages/pluggableWidgets/combobox-web`)
- and **internal shared libraries** dependencies if relevant code is in them (dependencies marked as `workspace:*` version and start with `@mendix/*`).

Unless it is an integration between widgets, for example data-grid filter widgets work with data-grid widget, widgets should be treated as isolated standalone entities.

## See also

[Widget scripts](./widget-scripts.md)
