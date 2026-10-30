# Headless widgets: replaceable UI for pluggable widgets

Status: exploration, not yet scheduled. First target: combobox, see [headless-combobox.md](./headless-combobox.md).

This document is the widget-agnostic concept. Per-widget documents hold the concrete contract, examples, migration plan, and questions for one widget.

## 1. Problem

Every widget in this repository is a monolith. One component owns the Mendix binding (EditableValue, ListValue, ActionValue), the lifecycle, the keyboard and ARIA behaviour, the popover positioning, and the HTML structure styled with Atlas UI classes. Atlas is coupled to an outdated Bootstrap, so the markup and class structure of every widget is dictated by it.

App developers increasingly want widgets to render in their own design system: Material UI, Ant Design, Tailwind, or a corporate component library. Today the only option is to override Atlas CSS against undocumented class names. Changing the HTML structure is impossible.

## 2. Goal

Split each widget into a part we own, which keeps the lifecycle, the Mendix API binding, and the hard behaviour, and a part the app developer may replace, which renders the HTML. Ship our own Atlas rendering as the default so existing apps see no change.

App developers never rebuild widgets. They write or adjust a View as a file in their own project, with our package in `node_modules`, and the widget picks it up. We stay in control of the Core and the Marketplace widget.

Non-goals for the first iteration:

- Data grid. Its surface is too large to prove the concept on.
- Studio Pro design-mode preview of custom UIs. The editor preview keeps its own simplified rendering.
- A visual theming tool. This is a code-level contract.

## 3. Vocabulary

| Term          | Meaning                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Core**      | Headless object per widget. Owns all state, the Mendix binding, and the lifecycle. Implemented with MobX.         |
| **ViewModel** | Plain, immutable object the Core exposes. State plus stable commands. The only required public contract.          |
| **View**      | React component that renders a ViewModel. We ship the Atlas View. App developers may ship their own.              |
| **Behavior**  | Optional hook that turns a ViewModel into DOM prop getters: keyboard handling and ARIA attributes.                |
| **Popover**   | Optional hook that positions a floating element. Wraps floating-ui.                                               |
| **Classes**   | Typed map of CSS hook names, one per rendered part. Overridable.                                                  |
| **Parts**     | Small components used by the Atlas View, one per element. Individually replaceable.                               |
| **Host**      | Whatever creates a Core and mounts a View. The pluggable widget is the host in apps; our test harness is another. |
| **Variant**   | Free-string name of a View, set per widget instance in Studio Pro through the `uiVariant` property.               |

"Headless" follows the industry use of the word (Headless UI, Radix Primitives, React Aria, Downshift).

## 4. Layering

```
Mendix props ──▶ Core (MobX store, Mendix binding, all state)
                   │
                   ├── ViewModel            plain data + stable commands        REQUIRED
                   ├── useXBehavior(vm)      keyboard + ARIA prop getters        optional
                   ├── useXPopover(vm)       floating refs + styles              optional
                   ├── classes()            CSS hook names                       optional
                   └── parts                one small component per element     optional
                              │
                              ▼
                           View  (Atlas default, or app developer's)
```

Rules that keep the layering honest:

1. The Core knows nothing about HTML. No class names, no refs, no DOM events.
2. The ViewModel contains plain data and functions. No MobX observables, no React nodes except where a slot explicitly carries one.
3. The Atlas View is built only from the ViewModel and the optional helpers. If the Atlas View needs something the ViewModel does not expose, the ViewModel is incomplete.
4. Behavior, Popover, Classes, and Parts are each a function of the ViewModel. None of them hold model state.
5. Studio Pro properties that only describe Atlas presentation are exposed as advisory `hints`. A custom View may ignore them.

## 5. State ownership

All state lives in the Core, including UI-looking state such as open flags, input text, and highlighted index. Reasons:

- Mendix often cares about it. Input text may drive a datasource filter and an event; a leave event may close a menu.
- A View built on a component library (Material UI, Ant) runs that library in controlled mode against the ViewModel. Such libraries accept open, input value, and value as controlled props.
- One source of truth makes conformance tests (section 11) meaningful regardless of the View.

Third-party behaviour libraries such as downshift may stay, but in fully controlled mode: the Core is the source of truth and the library reduces DOM events into Core commands.

## 6. Reactivity: MobX inside, plain objects outside

The Core is a MobX store. MobX is never exposed. The Mendix client bundles its own MobX version and widgets bundle another. `observer` from one copy cannot see observables from another, so exposing a MobX object would force every app developer onto our exact MobX instance.

### 6.1 Snapshot hook

The Core exposes `viewModel` as a MobX `computed`. A computed caches, so two reads with no state change in between return the same reference. That is exactly the contract `useSyncExternalStore` needs.

```ts
function useWidgetViewModel<VM>(core: { viewModel: VM }): VM {
    const subscribe = useCallback((onChange: () => void) => reaction(() => core.viewModel, onChange), [core]);
    const getSnapshot = useCallback(() => core.viewModel, [core]);
    return useSyncExternalStore(subscribe, getSnapshot);
}
```

A selector variant is offered next to it, built on `useSyncExternalStoreWithSelector`, so sub-components subscribe to a slice only:

```ts
const isOpen = useWidgetState(core, vm => vm.isOpen);
```

### 6.2 Structural sharing

The ViewModel is a tree of computeds, not one big computed. Each slice is its own cached getter. Per-item slices are cached by id with `computedFn`.

```ts
class SomeCore {
    get headerSlice() {
        return { value: this.store.inputValue, isOpen: this.store.isOpen };
    }
    get itemsSlice() {
        return this.store.visibleIds.map(id => this.itemSlice(id));
    }
    itemSlice = computedFn((id: string) => ({
        id,
        caption: this.store.caption(id),
        selected: this.store.isSelected(id)
    }));
    get viewModel() {
        return { ...this.headerSlice, items: this.itemsSlice, ...this.commands };
    }
}
```

A change in one slice rebuilds that slice and the top-level object. Every other slice and every unchanged item keep their reference, so `React.memo` in a View skips them. This is what keeps plain-object snapshots cheap enough for lists.

### 6.3 Commands are stable

Commands are bound once in the Core constructor. Their identity never changes, so `onClick={vm.open}` does not defeat memoisation.

### 6.4 Our own Views

Views inside this repository may use `observer` from our MobX copy and read the store directly for fine-grained updates. The Atlas View deliberately does not, for the first iteration. It consumes the ViewModel through the public snapshot hook, so it doubles as the proof that the contract is complete.

### 6.5 Rejected alternative: live ViewModel

A ViewModel whose properties are getters reading observables, with the Core supplying an `observer` wrapper (`core.observe(MyView)`), gives fine-grained tracking without exposing MobX. It is rejected as the default because of the classic footgun: passing the live object to a memoised child that reads a property the parent did not read means the child never updates. Plain snapshots cannot surprise anyone that way. It may return later as an opt-in for power users.

## 7. The ViewModel envelope

Every widget's ViewModel starts with the same envelope. This is what keeps the concept uniform across simple and complex widgets.

```ts
interface WidgetViewModel<Hints = {}, Texts extends TextMap = {}> {
    id: string;
    status: "loading" | "ready" | "unavailable";
    readOnly: boolean;
    validation?: string;
    a11y: { label?: string; required: boolean; describedBy?: string; statusMessage?: string };
    hints: Hints; // advisory, Atlas-presentation properties from Studio Pro
    t: Translate<Texts>; // all user-facing and ARIA texts, see 7.1
    tabIndex?: number; // Studio Pro "Tab index" system property
    className?: string; // Studio Pro "Class" system property
    style?: CSSProperties; // Studio Pro "Style" system property
}
```

Widget-specific state and commands extend it. Commands are referentially stable. Nothing in a ViewModel type may mention a behaviour library, a positioning library, Atlas, or class names.

### 7.1 Texts

Every text a View may need, including ARIA labels and live-region fragments, comes through one function on the envelope:

```ts
type TextMap = Record<string, readonly unknown[]>; // key -> parameter tuple

type Translate<Texts extends TextMap> = <K extends keyof Texts>(key: K, ...params: Texts[K]) => string;

// usage
vm.t("noOptions"); // "No options found"
vm.t("optionsAvailable", 12); // "Number of options available: 12"
```

Rules:

- **Keys and parameter arity are typed per widget.** Each widget declares its `TextMap`. A View author or an agent sees every available text in autocompletion, and a wrong parameter count fails to compile.
- **ARIA texts are ordinary texts.** Labels for clear, remove, select-all, and the live-region fragments are all keys. Nothing is hidden inside Behavior.
- **A composed live-region message is a convenience, not a replacement.** Where the Core composes a status message from several fragments and runtime state, it exposes the result as `a11y.statusMessage`, built through `t`. Behavior feeds it to the live region; a View without Behavior reads it directly. The atomic keys stay available.
- **Views bring their own strings for anything we do not define.** `t` only knows our keys. A custom View that wants an extra tooltip uses the app's own mechanism.
- **Parameter substitution is not our concern.** Placeholders, formatting, and language selection are done by the platform. We pass a key and parameters and get a string.

Where the strings come from is a platform matter. Mendix is introducing system text translations with an API of roughly this shape. We consume that API and wrap it, so the ViewModel shape stays ours and never exposes the platform type directly. Implementation details, including how the current per-instance text template properties map onto it, are deliberately left for later.

A range slider shows how small the widget-specific part can be, and that the envelope scales down:

```ts
interface RangeSliderViewModel extends WidgetViewModel<{ tooltipMode: "always" | "hover" | "never" }> {
    value: readonly [number, number];
    min: number;
    max: number;
    step: number;
    marks: ReadonlyArray<{ value: number; label?: string }>;
    orientation: "horizontal" | "vertical";
    setValue(next: readonly [number, number]): void; // live, while dragging
    commit(): void; // write to attributes and fire onChange
}
```

Complex widgets compose: a data grid ViewModel would hold column, row, pagination, and filter ViewModels, each with its own snapshot hook, so the structural sharing of section 6.2 applies one level deeper.

## 8. Optional helpers

All four helpers are functions of the ViewModel. A View picks the subset it needs. The Atlas View uses all of them.

### 8.1 Behavior

Behavior reads ViewModel state, calls ViewModel commands, and returns DOM attributes and handlers for the View to spread onto whichever elements it chooses. The shape is prop getters, the pattern downshift and React Aria use: one `getXProps()` per interactive element, returning `role`, `aria-*`, `id`, event handlers, a `ref` where focus management needs one, and the state data attributes from section 8.3.

It is a hook, not a field on the ViewModel, for three reasons. It needs DOM refs and effects such as restoring focus. It is optional, so a View built on a component library never calls it. Keeping it out of the ViewModel keeps the ViewModel pure data, which is what makes it serializable, loggable, and testable without a DOM.

### 8.2 Popover

Positioning is a separate hook from Behavior on purpose. Ant and Material UI bring their own popper but may still want our keyboard handling, or the reverse. The hook returns `setReference`, `setFloating`, `styles`, and `isPositioned`.

### 8.3 Classes and state attributes

The Classes map has one key per rendered part. Nothing for colours or sizes. Atlas framework classes such as `form-control` are not in the map; they belong to the Atlas View alone. Published names are API: renaming one is a breaking change of the npm package.

Structural identity goes in classes. State goes in boolean data attributes: `data-open`, `data-highlighted`, `data-selected`, `data-disabled`, `data-loading`, `data-empty`, `data-active`, `data-invalid`. Modifier classes such as `widget-x-item-highlighted` are retired. This is what makes every styling approach work without translation:

```scss
// Atlas SCSS
.widget-x-menu-item[data-highlighted] {
    background: $brand-primary-light;
}
```

```html
<!-- Tailwind -->
<li class="px-3 py-2 data-[highlighted]:bg-blue-50 data-[selected]:font-semibold"></li>
```

Overrides replace the default class for that key, they do not append. A Tailwind user does not want the Atlas class left behind dragging Atlas rules with it. Appending is explicit: `menuItem: cx(defaultClasses.menuItem, "extra")`.

### 8.4 Parts

Parts are the small components the Atlas View is assembled from, one per Classes key. Each receives its slice of the ViewModel plus the matching Behavior props, and spreads them. Replacing one part keeps keyboard and ARIA working because the props still come from our Behavior.

## 9. The View contract and the customisation levels

```ts
interface WidgetViewProps<Core, Classes, Parts> {
    core: Core;
    classes?: Partial<Classes>;
    parts?: Partial<Parts>;
}
```

Every View, ours or theirs, has this signature. That continuity is the point: a View that starts as a two-line class override never has to be thrown away to become a full rewrite.

| Level | What the app developer writes                                           | What they keep from us                  |
| ----- | ----------------------------------------------------------------------- | --------------------------------------- |
| 0     | CSS against published class names and data attributes. No View file.    | Everything                              |
| 1     | A View that renders our Atlas View with a `classes` override            | Markup, behaviour, positioning          |
| 2     | Same, plus one or more `parts` replaced                                 | Behaviour, positioning, remaining parts |
| 3a    | Their own markup using our Behavior and Popover hooks                   | Keyboard, ARIA, positioning             |
| 3b    | A component-library widget in controlled mode, using the ViewModel only | Data, Mendix binding, events            |

Concrete examples for each level live in the per-widget documents.

## 10. Hosting and delivery

### 10.1 The widget as a thin wrapper

The npm package is the product. The pluggable widget is the host for it inside apps. The wrapper keeps three responsibilities and sheds everything else:

1. Declare the Studio Pro surface: XML, editor config, editor preview, icons, package metadata.
2. Kickstart the Core: create on mount, feed container props on every render, dispose on unmount. The Core is assembled by a brandi container, the composition root pattern already used by datagrid-web, gallery-web and maps-web: static properties in a frozen config, Mendix values through a props gate, side effects as setup components.
3. Resolve the View: read the `uiVariant` property, ask the registry, fall back to the Atlas View.

```tsx
export default function SomeWidget(props: SomeWidgetContainerProps) {
    const core = useSomeWidgetCore(props);
    const View = useWidgetView("SomeWidget", props.uiVariant);
    return <View core={core} />;
}
```

Our own test harness and Storybook host the Core with the same lines. If the wrapper needs a private API the harness cannot reach, the design has a hole.

### 10.2 Package layout

A new package type beside `pluggableWidgets` and `shared`:

```
packages/
  headless/<widget>/             @mendix/<widget>-core      public npm package
    src/core/                    store, providers, ViewModel builder
    src/hooks/                   useXViewModel, useXState, useXBehavior, useXPopover
    src/atlas/                   XView, parts, classes, X.scss
    src/conformance/             shared test suite (section 11)
    examples/                    one View per customisation level
    AGENTS.md                    agent-facing guide to the contract
  pluggableWidgets/<widget>-web/ thin wrapper, depends on the core as workspace:*
```

In the first iteration a Core accepts the generated `XContainerProps` directly. That couples the npm package to the XML, so they move together. A narrower config type is a later refinement.

### 10.3 Delivery: Views live in the app project

This is the primary and, for now, the only supported route.

- The app developer's View is a source file inside their Mendix project. It is theirs to edit, by hand or by an AI agent. It exports a component and nothing else.
- Our Core, hooks, Atlas View, parts, and types sit in `node_modules` next to that file. The thin widget sits in the project as the Marketplace MPK. Neither is edited by the app developer.
- **Compilation is the project bundler's job.** The View file is compiled by the Mendix project bundler at project run or build time, together with everything else, never earlier and never by us. We ship source-compatible packages and types, not a build step.
- **Duplication is the project bundler's job.** The MPK, the package in `node_modules`, and the View file are bundled in the same pass. We do not design around two copies.
- **The registry belongs to the client.** It is a client-owned lookup from widget id plus variant name to a View component. The widget only reads from it.
- **Registration belongs to Studio Pro.** How a View file becomes known to the registry is out of scope for this design. We assume the View is already in the registry when the widget mounts.
- **For the first iteration both are hardcoded.** Until the client and Studio Pro provide them, the registry is a small window-scoped object we own, following the pattern of `widget-plugin-external-events`, and registration is a hardcoded call in a known place. This is scaffolding to prove the contract, not the design.
- **`uiVariant` is a free string**, defaulting to `atlas`. A picker or enumeration may come later.

React is enforced by the Mendix client, so a registered View runs on the same React as the widget.

**Rejected for now: the rebuild route.** App developers could scaffold a widget around the Core and ship it with the same widget id. Rejected because we want to stay in control of the widget, and because it puts the app developer in charge of a build pipeline when they should only be in charge of UI.

### 10.4 Least friction: built for agents as much as for people

The app developer, and increasingly their AI agent, should concentrate on the UI and nothing else. The package therefore carries everything an agent needs to produce a correct View without reading our source:

- **Types are the documentation.** Every public type has a JSDoc line per member stating what it is and when it changes.
- **Examples ship in the package.** One View per customisation level. An agent copies the closest one.
- **An agent-facing guide ships in the package.** Describes the contract, the levels, the rule that `hints` are advisory, and the data-attribute convention.
- **Conformance tests run inside the project.** The suite from section 11 is importable, so a View can be tested locally and by the agent before the app runs.
- **Optional scaffold command.** Writes the level-1 example and a conformance test file into the project. An agent can do the same from the examples folder.

Success test: an agent with only the package in `node_modules` and a one-line request ("make the combobox look like our Tailwind design system") produces a working, accessible View on the first attempt.

### 10.5 Versioning

Two versions after the split. The npm package follows semver on the ViewModel, the Behavior getters, the Parts props, and the Classes map. The MPK remains a Marketplace artifact that pins a core version. Changelog discipline covers both.

## 11. Conformance tests

We cannot guarantee accessibility of a custom View. We can hand the author the test suite we use ourselves. Each package ships a Jest + RTL suite and a Playwright suite that take any View component for that widget and assert the behaviour the widget promises: opening, keyboard navigation, selection, dismissal, ARIA state tracking, lazy loading where applicable. The Atlas View runs the same suite in CI.

## 12. Rollout order

1. Combobox, internally, with no publishing. Proves Core, ViewModel, Behavior, Popover, Classes, Parts, and the Atlas View split. See [headless-combobox.md](./headless-combobox.md).
2. A throwaway second View on a component library, run against the conformance suite. The real test of the contract.
3. The in-project delivery route, with the hardcoded registry and registration, in a Mendix test project.
4. Range slider, to confirm the envelope generalises down.
5. Publishing to npm.
6. Remaining widgets one at a time. Data grid last.

## 13. Open questions (generic)

- Does the registry key on widget id, or on a stable headless package name, so that a renamed widget keeps its Views?
- Should the envelope carry the Studio Pro label (`labelId`, label caption) for widgets with the Label system property, or is that the host's concern?
- Where does `useWidgetView` and the temporary registry live: a new shared plugin package, or inside `widget-plugin-platform`?
- Which widgets after the range slider? Candidates with small surfaces and clear value: switch, rating, badge button, progress bar.
- `widget-plugin-dropdown-filter` carries a second, private combobox implementation for the data grid filters. Once the headless combobox exists, should the filter controls become Views over the same Core, or stay separate because their model (filter store, not attribute binding) differs?
- How do we test a View in isolation inside this repo before the registry exists: Storybook, a Jest harness hosting the Core with mocked Mendix values from `widget-plugin-test-utils`, or both?

## 14. Decisions log

| Date       | Decision                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-28 | Views live in the app project; the rebuild route is rejected. We stay in control of the Core and the MPK.                                                                                |
| 2026-10-28 | The project bundler compiles the View file and deduplicates the package. We ship no build step.                                                                                          |
| 2026-10-28 | Registry is the client's; registration is Studio Pro's. Both hardcoded in the first iteration.                                                                                           |
| 2026-10-28 | `uiVariant` is a free string.                                                                                                                                                            |
| 2026-10-28 | Editor preview keeps its own simplified rendering.                                                                                                                                       |
| 2026-10-28 | MobX inside the Core, never exposed. Plain snapshot ViewModel with structural sharing is the public contract.                                                                            |
| 2026-10-28 | Atlas View consumes the ViewModel through the public hook, as proof the contract is complete.                                                                                            |
| 2026-10-28 | Combobox first, range slider second, data grid deferred.                                                                                                                                 |
| 2026-10-28 | Options carry `caption: string` always and `content?: ReactNode` when configured. Placement is a hint; the Core never decides where content is shown.                                    |
| 2026-10-28 | All texts, ARIA included, come through a typed `t(key, ...params)` on the envelope, wrapping the upcoming platform system-text API. Mechanics out of scope.                              |
| 2026-10-30 | The Core is composed with a brandi container like the data grid and gallery: config, gate, selector family and setup host as bindings. The container never crosses the package boundary. |
