# Widget scripts

Every widget has own set of script to build, test, lint the package. You MUST run those using pnpm from the package root, not from the repo root.
For example, to run unit tests:

```
cd packages/pluggableWidgets/combobox-web
pnpm run test
```

## Build widget

To build a widget: `pnpm turbo build`. This builds shared dependencies (with cache) and the widget itself.

## Run unit test

To run unit tests: `pnpm run test`. Under the hood, this is a Jest CLI. Additional options can be passed, for example:

- `pnpm run test -u` to update snapshots
- `pnpm run test -t "renders combobox widget"` to run specific specs
- other Jest options can be used

Note: do not put `--` in between.
