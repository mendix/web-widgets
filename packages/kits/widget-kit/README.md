# @mendix/widget-kit

What every headless widget package shares, and nothing a single widget owns. See
`docs/design/headless-widgets.md`, sections 7 and 8.5.

- `WidgetViewModel`: the envelope of five fields every pluggable widget fills; `InputViewModel`: the
  facet of Studio Pro's input widgets; `Translate` and `TextMap` for the typed texts.
- `focusBoundaryProps(vm)`: the focus handlers a View spreads on its root so `enter` and `leave` fire.
- `useObservableSnapshot(read)`: subscribes a host component to a MobX computed and returns the snapshot.
