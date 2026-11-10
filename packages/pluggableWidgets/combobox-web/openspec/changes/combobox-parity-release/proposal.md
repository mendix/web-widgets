## Why

The first release of the migrated widget is a parity release: it ships the Core, MobX and the Atlas View to existing apps with no change for app developers or their users. The view-variant work (the sandbox View, the Core-composed status message it needed, and `uiVariant` with the registry) continues after that release. The name-suffix trial registry was already removed in `refactor(combobox-web): always render the atlas view`.

## Root Cause

Three pieces of the branch went beyond the released widget:

- The Core composed `a11y.statusMessage` so that a View without the Behavior could announce it. The text differs from the released widget in three places: single mode no longer announced "No options selected.", multi mode announced the option count while an option was highlighted, and a closed multi-select with no options announced its selection.
- `src/sandbox/BareView.tsx`, a second View that is not built into the MPK.
- The CHANGELOG deprecated the state modifier classes, which commits app developers to a future removal.

## What Changes

- `useComboboxBehavior` composes the live-region text in downshift's `getA11yStatusMessage` again, word for word as the released widget did, through `vm.t`. `ComboboxCore` loses the `statusMessage` computed; `ComboboxViewModel.a11y` is `InputA11y`; `ComboboxA11y` leaves the contract entry.
- `src/sandbox/` is deleted with its spec and README; `tsconfig.build.json` and `AGENTS.md` drop it. The conformance suite stays and runs the Atlas View.
- The `Deprecated` CHANGELOG entry is dropped. The modifier classes keep being emitted next to the data attributes; the comments in `legacyModifiers.ts` and `classes.ts` no longer promise a removal.
- `docs/design/headless-combobox.md` records the parity-release scope.

## Impact

- **Behaviour**: the screen-reader announcements match the released widget again. No DOM or visual change.
- **Apps**: none. Custom CSS against the modifier classes keeps working, without a deprecation notice.
- **Release**: the `Deprecated` CHANGELOG entry is removed; no new entry.
- **Dependencies**: none.
