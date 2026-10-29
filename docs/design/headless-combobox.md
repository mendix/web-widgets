# Headless combobox

Status: exploration, first target of [headless-widgets.md](./headless-widgets.md). Read that document first; this one only holds what is specific to `combobox-web`.

## 1. Where the seam is today

The combobox is closer to the concept than it looks. The `Selector` interface in `src/helpers/types.ts` is already a headless model: options, captions, selection, search term, lazy loading, validation, read-only state, Mendix binding. It knows nothing about HTML.

The other half is tangled into the UI. `SingleSelection.tsx` and `MultiSelection.tsx` each do three jobs at once: wire downshift (keyboard, ARIA, open state), wire floating-ui (positioning), and render Atlas markup with `form-control` classes. So the split is three-way:

| Today                                                           | Becomes                    |
| --------------------------------------------------------------- | -------------------------- |
| `helpers/` providers and selectors, `useGetSelector`            | Core store and ViewModel   |
| `useDownshiftSingleSelectProps`, `useDownshiftMultiSelectProps` | `useComboboxBehavior`      |
| `useFloatingMenu`                                               | `useComboboxPopover`       |
| `components/`, `ui/Combobox.scss`                               | Atlas View, parts, classes |
| `Combobox.tsx`                                                  | Thin wrapper               |

`useGetSelector` already hand-rolls a store and forces re-renders with `setInput({})`. Replacing it with a MobX store and the snapshot hook is a small move.

Two side channels in the current code disappear once the Core owns UI state, and are worth knowing about before touching the hooks:

- `useDownshiftSingleSelectProps` and its multi counterpart assign `selector.onLeaveEvent = closeMenu`, so the model holds a callback into downshift. With `isOpen` in the Core, `leave()` closes the menu directly.
- `useGetSelector` registers `onAfterSearchTermChange` on the options provider purely to trigger a React re-render. With MobX, the search term is observable and no callback is needed.

The selector families (association, database, static, enum/boolean) each have a `Preview/` variant used only by `Combobox.editorPreview.tsx`. Since the editor preview keeps its own rendering, the preview providers can stay in the widget package, or ship in the core package as a `preview` entry. Decide in migration step 1.

The dropdown-filter plugin (`shared/widget-plugin-dropdown-filter`) is the in-repo precedent: controllers, stores, a `classes()` map in `picker-primitives.tsx`, and a `Combobox` control driven by a `useComboboxProps` factory. It was never designed as a public surface, but its shape is the right one.

## 2. State ownership decisions

All of `isOpen`, `inputValue`, and `highlightedIndex` live in the Core:

- `inputValue` drives the datasource filter (`setSearchTerm`) and the `onChangeFilterInputEvent` with its debounce.
- `onLeaveEvent` closes the menu, so the Core must own `isOpen`.
- `highlightedIndex` is needed for the ARIA status message, and a library View simply ignores it.

Downshift stays for keyboard and ARIA, but fully controlled: `isOpen`, `inputValue`, `selectedItem`, and `highlightedIndex` are all passed in from the Core and every `onXChange` forwards to a Core command. The key handling and accumulated bug fixes in the two downshift hooks survive the move unchanged.

Chip order for multi-select (`selectedItemsSorting`) is a model concern, exposed as the order of `chips`, because it is a Studio Pro property with data meaning. It is not a hint.

## 3. ViewModel

```ts
interface ComboboxOptionVM {
    id: string;
    caption: string; // always present: the caption attribute or expression
    content?: ReactNode; // present whenever a custom-content widget is configured, regardless of placement
    selected: boolean;
    highlighted: boolean;
}

interface ComboboxHints {
    readOnlyStyle: "control" | "text";
    selectedItemsStyle: "boxes" | "text";
    loadingType: "skeleton" | "spinner";
    customContent: "none" | "everywhere" | "menuOnly"; // Studio Pro "no" | "yes" | "listItem"
}

interface ComboboxViewModel extends WidgetViewModel<ComboboxHints> {
    mode: "single" | "multi";

    // state
    options: ReadonlyArray<ComboboxOptionVM>;
    value: string | ReadonlyArray<string> | null;
    selected: ComboboxOptionVM | null; // single mode, the selected option with its caption and content
    chips: ReadonlyArray<ComboboxOptionVM>; // multi mode, selected items in configured order
    inputValue: string;
    isOpen: boolean;
    highlightedIndex: number;
    clearable: boolean;
    filterable: boolean;
    allSelected: "all" | "some" | "none"; // multi mode, select-all checkbox state
    loading: { isLoading: boolean; hasMore: boolean };
    slots: { menuFooter?: ReactNode };

    // commands, referentially stable
    open(): void;
    close(): void;
    toggle(): void;
    highlight(index: number): void;
    select(id: string): void;
    deselect(id: string): void;
    toggleItem(id: string): void;
    clear(): void;
    selectAll(): void;
    setInputValue(text: string): void;
    loadMore(): void;
    enter(): void; // widget received focus from outside, fires onEnterEvent
    leave(): void; // focus left the widget, fires onLeaveEvent and closes
}
```

Notes:

- `caption` is always a string. The Core needs it anyway for filtering, downshift's `itemToString`, and the ARIA status message.
- `content` is the widget tree the app developer configured under "Custom content" (`optionsSourceAssociationCustomContent` and its database and static siblings). It is the one place React leaks into the contract. The Core builds it whenever the widget is configured and never decides where it is shown. Placement is the View's decision, guided by `hints.customContent`: the Atlas View renders `content` in the menu for `everywhere` and `menuOnly`, and in the input and chips for `everywhere` only. A custom View renders `content ?? caption` wherever it likes. This is safe because every use of the placement today is presentational: `CaptionsProvider.render`, the class and placeholder toggles in `SingleSelection`, and `getSelectedCaptionsPlaceholder`.
- `enter` and `leave` exist so a View that does not use our Behavior can still fire the Mendix enter and leave events.
- All texts come through `vm.t`, see the generic document, section 7.1. The combobox text map:

```ts
interface ComboboxTexts {
    noOptions: [];
    emptyOption: [];
    clearSelection: [];
    removeSelection: [];
    selectAll: [];
    a11ySelectedValue: [caption: string];
    a11yOptionsAvailable: [count: number];
    a11yInstructions: [];
    a11yNoOption: [];
}
```

The status message that downshift builds today by concatenating `a11ySelectedValue`, the count, `a11yOptionsAvailable`, and `a11yInstructions` becomes `a11y.statusMessage`, composed by the Core through `t`. A View using our Behavior gets it in the live region; a View without Behavior reads it directly. Parametrised keys replace today's string concatenation, so word order is no longer fixed to English.

### Structural sharing slices

`inputSlice` (inputValue, isOpen, highlightedIndex), `selectionSlice` (value, selected, chips, allSelected), `optionsSlice` (array of per-id `optionSlice` entries), `loadingSlice`, `staticSlice` (hints, t, clearable, filterable, a11y). Typing a character rebuilds `inputSlice` only. Moving the highlight creates exactly two new option objects.

## 4. Behavior

```ts
interface ComboboxBehavior {
    getRootProps(): { onFocus; onBlur }; // enter and leave detection via relatedTarget
    getInputProps(): {
        id;
        role: "combobox";
        value;
        onChange;
        onKeyDown;
        onFocus;
        onBlur;
        ref;
        "aria-expanded";
        "aria-controls";
        "aria-activedescendant";
        "aria-autocomplete";
        "aria-invalid";
        "aria-describedby";
        "aria-required";
        "aria-label";
        "aria-labelledby";
        "data-open";
        "data-disabled";
    };
    getToggleProps(): { tabIndex: -1; onClick; onMouseDown; "aria-label"; "data-open" };
    getMenuProps(): { id; role: "listbox"; "aria-labelledby"; "aria-multiselectable"; onMouseDown; onScroll; ref };
    getOptionProps(index: number): {
        id;
        role: "option";
        "aria-selected";
        onClick;
        onMouseMove;
        "data-highlighted";
        "data-selected";
    };
    getChipProps(index: number): { tabIndex; onKeyDown; ref; "data-active" };
    getChipRemoveProps(index: number): { onClick; "aria-label"; tabIndex: -1 };
    getClearProps(): { onClick; "aria-label"; tabIndex };
    getSelectAllProps(): { onClick; "aria-label"; checked: "all" | "some" | "none" };
}

function useComboboxBehavior(vm: ComboboxViewModel): ComboboxBehavior;
```

Behaviour that must survive, with its current home:

- Backspace on an empty single-select input clears when clearable (`SingleSelection.onInputKeyDown`).
- Backspace and ArrowLeft redirect to chips only when the caret rule in `isChipNavigationPermitted` allows it (`MultiSelection`).
- Focus restoration after chip removal (`MultiSelection`, chipRefs effect).
- Space toggles the highlighted item in multi mode without closing.
- Menu `onMouseDown` prevents blur; header and footer stop propagation so clicks inside do not close.
- Lazy loading triggers from menu scroll (`useLazyLoading`).

## 5. Popover

```ts
function useComboboxPopover(vm: ComboboxViewModel, options?: { alwaysOpen?: boolean }): ComboboxPopover;
```

Wraps today's `useFloatingMenu`: fixed strategy, bottom-start, flip, size capped at 320px, width matched to the reference. `alwaysOpen` is the editor preview's `keepMenuOpen` and disables floating entirely.

## 6. Classes

```ts
type ComboboxClassKey =
    | "root"
    | "inputContainer"
    | "input"
    | "placeholder"
    | "toggle"
    | "clear"
    | "chip"
    | "chipRemove"
    | "selectAll"
    | "menu"
    | "menuList"
    | "menuItem"
    | "menuHeader"
    | "menuFooter"
    | "noOptions"
    | "loader"
    | "validation";

function classes(prefix = "widget-combobox"): Record<ComboboxClassKey, string>;
```

Today's modifier classes and their replacements:

| Today                                      | Becomes                            |
| ------------------------------------------ | ---------------------------------- |
| `widget-combobox-input-container-active`   | `inputContainer` + `data-open`     |
| `widget-combobox-input-container-disabled` | `inputContainer` + `data-disabled` |
| `widget-combobox-menu-hidden`              | `menu` without `data-open`         |
| `widget-combobox-item-highlighted`         | `menuItem` + `data-highlighted`    |
| `widget-combobox-item-selected`            | `menuItem` + `data-selected`       |
| `widget-combobox-input-nofilter`           | `input` + `data-readonly`          |
| `widget-combobox-menu-lazy-scroll`         | `menuList` + `data-lazy`           |

`form-control` and `form-control-static` are applied by the Atlas View only, from `hints.readOnlyStyle`.

## 7. Parts

```ts
interface ComboboxParts {
    Root;
    InputContainer;
    Input;
    Placeholder;
    Toggle;
    Clear;
    Chip;
    ChipRemove;
    SelectAll;
    Menu;
    MenuList;
    Option;
    MenuHeader;
    MenuFooter;
    NoOptions;
    Loader;
    Validation;
}
```

Each part receives `{ vm, className }` plus its Behavior props (for example `Option` receives `option`, `index`, `optionProps`). The Atlas View is the composition of these parts and nothing else.

## 8. View contract

```ts
interface ComboboxViewProps {
    core: ComboboxCore;
    classes?: Partial<ComboboxClasses>;
    parts?: Partial<ComboboxParts>;
}
type ComboboxViewComponent = ComponentType<ComboboxViewProps>;
```

## 9. Examples per customisation level

All of these are files in the app project, see the delivery section of the generic document. Each exports a `ComboboxViewComponent` and nothing else.

### Level 0: CSS only, no JavaScript

```css
.widget-combobox-menu-item[data-highlighted] {
    background: var(--brand-50);
}
.widget-combobox-menu-item[data-selected] {
    font-weight: 600;
}
```

### Level 1: a few class touches

```tsx
import { ComboboxView, type ComboboxViewComponent } from "@mendix/combobox-core";

export const MyCombobox: ComboboxViewComponent = props => (
    <ComboboxView {...props} classes={{ menuItem: "my-brand-option", toggle: "my-brand-caret" }} />
);
```

Tailwind, same file shape:

```tsx
export const MyCombobox: ComboboxViewComponent = props => (
    <ComboboxView
        {...props}
        classes={{ menuItem: "px-3 py-2 data-[highlighted]:bg-blue-50 data-[selected]:font-semibold" }}
    />
);
```

### Level 2: replace one part

```tsx
import { ComboboxView, type ComboboxParts, type ComboboxViewComponent } from "@mendix/combobox-core";

const MyOption: ComboboxParts["Option"] = ({ option, optionProps, className }) => (
    <li {...optionProps} className={className}>
        <Avatar id={option.id} />
        {option.content ?? option.caption}
    </li>
);

export const MyCombobox: ComboboxViewComponent = props => <ComboboxView {...props} parts={{ Option: MyOption }} />;
```

Keyboard and ARIA keep working because `optionProps` still comes from our Behavior.

### Level 3a: full View with our Behavior (Tailwind, raw markup)

```tsx
import {
    useComboboxViewModel,
    useComboboxBehavior,
    useComboboxPopover,
    type ComboboxViewComponent
} from "@mendix/combobox-core";

export const MyCombobox: ComboboxViewComponent = ({ core }) => {
    const vm = useComboboxViewModel(core);
    const b = useComboboxBehavior(vm);
    const pop = useComboboxPopover(vm);
    return (
        <div {...b.getRootProps()} className="relative">
            <input {...b.getInputProps()} ref={pop.setReference} className="w-full rounded border px-3 py-2" />
            <button {...b.getToggleProps()} className="absolute right-2 top-2">
                ▾
            </button>
            {vm.isOpen && (
                <ul {...b.getMenuProps()} ref={pop.setFloating} style={pop.styles} className="rounded bg-white shadow">
                    {vm.options.map((o, i) => (
                        <li key={o.id} {...b.getOptionProps(i)} className="px-3 py-2 data-[highlighted]:bg-blue-50">
                            {o.content ?? o.caption}
                        </li>
                    ))}
                </ul>
            )}
            {vm.validation && <p role="alert">{vm.validation}</p>}
        </div>
    );
};
```

### Level 3b: full View with a component library (Material UI, no Behavior)

```tsx
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useComboboxViewModel, type ComboboxViewComponent } from "@mendix/combobox-core";

export const MyCombobox: ComboboxViewComponent = ({ core }) => {
    const vm = useComboboxViewModel(core);
    const byId = (id: string | null) => vm.options.find(o => o.id === id) ?? null;
    return (
        <Autocomplete
            open={vm.isOpen}
            onOpen={vm.open}
            onClose={vm.close}
            options={vm.options}
            getOptionLabel={o => o.caption}
            renderOption={(props, o) => <li {...props}>{o.content ?? o.caption}</li>}
            value={vm.mode === "single" ? vm.selected : vm.chips}
            onChange={(_, next) => (next ? vm.select(next.id) : vm.clear())}
            inputValue={vm.inputValue}
            onInputChange={(_, text) => vm.setInputValue(text)}
            disabled={vm.readOnly}
            loading={vm.loading.isLoading}
            renderInput={params => (
                <TextField {...params} error={!!vm.validation} helperText={vm.validation} required={vm.a11y.required} />
            )}
            onFocus={vm.enter}
            onBlur={vm.leave}
        />
    );
};
```

Material UI owns keyboard and ARIA here. The Core still owns data, Mendix binding, lazy loading, and events. `highlightedIndex` is ignored, which is harmless. `getOptionLabel` uses the plain `caption`; `renderOption` shows custom `content` when the app developer configured it, ignoring the `menuOnly` versus `everywhere` hint, which is the View's prerogative.

## 10. Thin wrapper and package layout

```tsx
// packages/pluggableWidgets/combobox-web/src/Combobox.tsx
export default function Combobox(props: ComboboxContainerProps) {
    const core = useComboboxCore(props);
    const View = useWidgetView("Combobox", props.uiVariant);
    return <View core={core} />;
}
```

```
packages/
  headless/combobox/               @mendix/combobox-core
    src/core/                      ComboboxCore, store, providers (from helpers/), ViewModel builder
    src/hooks/                     useComboboxViewModel, useComboboxState, useComboboxBehavior, useComboboxPopover
    src/atlas/                     ComboboxView, parts/, classes.ts, Combobox.scss
    src/conformance/               shared test suite
    examples/                      the five Views above
    AGENTS.md
  pluggableWidgets/combobox-web/   Combobox.tsx wrapper, XML, editorConfig, editorPreview, icons
```

`Combobox.xml` gains one property: `uiVariant`, string, default `atlas`, in the Advanced group. `Combobox.editorPreview.tsx` stays as it is.

## 11. Safety net

The existing net is thinner than the migration needs. Status at 2026-10-28:

| Layer                | Coverage                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Component unit tests | 29 cases across `SingleSelection`, `MultiSelection`, `StaticSelection`, with 3 DOM snapshots                               |
| Helper unit tests    | 20 cases, all on the database selector and its utils                                                                       |
| E2E                  | 28 Playwright cases with 17 visual snapshots: every data source family, keyboard chip handling, onChange, menu positioning |

Not covered directly at that date: association, static, enum, and boolean selectors; lazy loading; the filter-event debounce; enter and leave events; custom content; validation display. These are exactly what step 1 touches.

Update, same day: the OpenSpec change `combobox-selector-safety-net` in the package added characterisation tests for rule 1 below. The unit suite went from 6 suites and 61 tests to 16 suites and 194 tests with the 5 snapshots untouched. Every selector family, `getSelector`, `BaseOptionsProvider` filtering, `LazyLoadProvider`, `datasourceFilter` and the `useGetSelector` seam are covered, and each pinned quirk is marked `// Quirk:` in the test and listed in that change's `design.md`. Enter and leave events, custom content rendering beyond `caption.render`, and validation display remain covered only through the component tests.

Rules, in order of application:

1. **Characterisation tests first, at the seam that does not move.** The `Selector` interface stays the Core's internal API in step 1. Before any change, write tests against it for every family using the builders in `widget-plugin-test-utils`: `currentId`, `setValue` writing to the attribute or association, `options.getAll` under a search term, `caption.get`, `readOnly`, `validation`, `clearable`, `loadMore`, and `updateProps` transitions from unavailable to available. They pass on the old code and must pass unchanged on the new code. This is what the package's tdd-refactor OpenSpec schema calls "existing behaviour preservation tests".
2. **Strangler, not rewrite.** Step 1 changes the inside of `useGetSelector` and the providers only. `components/` and its tests are untouched. A snapshot diff in steps 1 to 3 is a regression; `pnpm run test -u` is not allowed in those steps.
3. **Split the store change from the re-render change.** Convert the store to MobX while keeping the `setInput({})` trigger, verify, then replace the trigger with a reaction in a separate commit. Two small diffs bisect; one large one does not.
4. **MobX strict mode in tests.** `configure({ enforceActions: "always" })` in the Jest setup, so any mutation outside an action throws in CI instead of showing up as stale UI in Studio Pro.
5. **Never make Mendix values observable.** `ListValue`, `EditableValue`, `ListWidgetValue` go in as `observable.ref` through a props gate, the pattern `widget-plugin-mobx-kit` and the dropdown-filter stores already use. Wrapping one in `makeAutoObservable` breaks silently.
6. **E2E is the gate per step.** Visual snapshots stay identical through step 3. Step 4 (classes and data attributes) is the only step that changes the DOM on purpose and the only step where snapshots are updated, with the diff reviewed in the PR.
7. **Run the component suite against both paths in step 2.** Keep the Selector path alive behind a test-only switch while the ViewModel path is introduced, parametrise the component tests to run twice, delete the old path once both are green.
8. **Manual checklist in Studio Pro** on the `combobox-web-atlas4` test project: one page per data source family, plus read-only, validation, custom content, lazy loading, and the onChange flows. Automated tests do not exercise the editor preview, and the preview providers share code with the runtime ones.

## 12. Migration plan

Each step keeps the MPK, the XML, and the existing unit and E2E tests green.

1. **Extract the store.** Precondition: section 11, rules 1 to 5 in place. Move `getSelector`, the providers, and the selectors into a MobX store under a Core. Replace the forced re-render in `useGetSelector` with the snapshot hook. No change to `components/`.
   Status 2026-10-29: done in the package change `combobox-mobx-store` (stacked on the safety-net branch). The selectors and providers are observable, `useObservableSnapshot` replaces the `setState({})` trigger and subscribes to the search term only. The props gate was deferred to step 2 because the `Selector` seam still takes props by method call.
2. **Build the ViewModel.** Add the computed slices from section 3. Rewrite `SingleSelection` and `MultiSelection` to read from the ViewModel instead of the Selector. Whatever they cannot get from the ViewModel is a gap in the contract; fix the contract, not the View.
3. **Extract Behavior and Popover.** Make downshift controlled by the Core. Move `useDownshift*` and `useFloatingMenu` into the two hooks with the getter shapes from sections 4 and 5. Verify every item in the "behaviour that must survive" list.
4. **Introduce classes and data attributes.** Replace literal class names with the map and modifier classes with data attributes per the table in section 6. Update `Combobox.scss` and the E2E selectors.
5. **Split into parts.** Break the Atlas View into one component per class key. Add the `classes` and `parts` props.
6. **Move to a package.** Create `packages/headless/combobox`, point the widget at it, reduce `Combobox.tsx` to the wrapper in section 10.
7. **Write the second View.** A throwaway Material UI View in a sandbox, run against the conformance suite. This is the real test of the ViewModel shape.
8. **Prove the in-project route.** Add `uiVariant` and the hardcoded first-iteration registry. Put a View file into a Mendix test project with the package in `node_modules`, let the project bundler compile it, hardcode its registration, and confirm the widget renders it with `uiVariant` set.

Publishing to npm comes after step 8.

## 13. Open questions (combobox)

- Which Mendix test project proves step 8, and where exactly does the hardcoded registration call live?
- Does the existing combobox OpenSpec folder get one change per migration step, or one change for the whole split?
