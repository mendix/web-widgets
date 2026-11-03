# Sandbox

Throwaway Views used to test the ViewModel contract. Nothing in this folder is imported by the
widget, so none of it ends up in the MPK; the specs run with the package suite.

- `BareView.tsx`: plain markup with its own keyboard handling and ARIA, no Behavior, no Popover,
  no classes. It stands in for a View built on a component library that owns keyboard and ARIA
  itself (section 9, level 3b of `docs/design/headless-combobox.md`), and runs against the
  conformance suite in `src/conformance/`.
