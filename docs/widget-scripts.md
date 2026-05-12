# Widget scripts

Every widget has own set of script to build, test, lint the package. You MUST run those using pnpm from the package root, not from the repo root.
For example, to run unit tests:

```
cd packages/pluggableWidgets/combobox-web
pnpm run test
```

## Build widget

When building the widget, use `pnpm turbo build`, this forces shared dependencies to build (with cache) and the widget itself.

## Run unit test

`pnpm run test` command is used to run tests, under the hood, this is a jest CLI. So additional options can be passed, for example:

- `pnpm run test -u` to update snapshots
- `pnpm run test -t "renders combobox widget"` to run specific specs
- other Jest options can be used
