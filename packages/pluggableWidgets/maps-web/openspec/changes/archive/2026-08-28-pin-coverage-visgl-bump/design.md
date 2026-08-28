## Test Cases

All tests live in `src/components/__tests__/GoogleMap.spec.tsx` unless stated otherwise.

The `gmp-pin` deprecation warning itself originates from Google's remote Maps JavaScript API script and therefore cannot be observed in jsdom. The tests below assert the _structural_ consequence of the deprecated call instead, which is deterministic under `@googlemaps/jest-mocks` and flips from red to green on the bump. See Notes for why this works.

### Reproduction Tests

- renders a `gmp-pin` element for a marker with no custom image (unit)
    - **Given**: `initialize()` from `@googlemaps/jest-mocks` has run, and `locations` contains a single marker with `title`, `latitude`, `longitude` and **no** `url`
    - **When**: `GoogleMapContainer` renders and pending promises are flushed inside `act`
    - **Then**: exactly one `PinElement` instance has been constructed (`mockInstances.get(PinElement)` has length 1), and that instance is attached to the document (`isConnected === true`)
    - **Red on `0.8.3`**: `Pin` executes `advancedMarker.content = pinElement.element`. The mocked `PinElement` extends `HTMLElement` and exposes no `element` property, so `content` is assigned `undefined` and the pin never enters the DOM — the `isConnected` assertion fails.
    - **Green on `1.9.0`**: `Pin` detects the registered `gmp-pin` custom element, routes to `PinModern`, and appends the `PinElement` instance directly.

- does not read the deprecated `element` property of `PinElement` (unit)
    - **Given**: a getter spy installed on `PinElement.prototype.element` (via `Object.defineProperty`) that records access, restored in `afterEach`
    - **When**: a marker with no `url` renders
    - **Then**: the getter is never invoked
    - **Red on `0.8.3`**: getter invoked once per default marker.
    - This test encodes the deprecation directly and is the one that will fail again if the dependency ever regresses.

### Edge Cases

- renders an `img` and no pin for a marker with a custom image (unit)
    - **Given**: `locations` contains a single marker with `url: "image:url"`
    - **When**: the map renders
    - **Then**: an `img` with that `src` is present, and **no** `PinElement` was constructed
    - Guards the `marker.url && ...` / `!marker.url && <Pin />` split in `src/components/GoogleMap.tsx` so a future change cannot silently route image markers through `Pin`.

- renders a pin for the default marker and an image for the custom marker in one map (unit)
    - **Given**: `locations` contains two markers — one with `url`, one without
    - **When**: the map renders
    - **Then**: exactly one `PinElement` is constructed and exactly one `img` is rendered

- renders a pin for the current-location marker when it has no image (unit)
    - **Given**: `showCurrentLocation: true` and `currentLocation` set with no `url`
    - **When**: the map renders
    - **Then**: a `PinElement` is constructed for it
    - The existing `currentLocation` fixture sets `url`, so this branch is currently unexercised.

- opens an info window with the marker title when a default pin is clicked (unit)
    - **Given**: a marker with no `url` and a `title`
    - **When**: the marker's `onClick` fires
    - **Then**: the title is rendered in an `InfoWindow`
    - `InfoWindowProps.anchor` accepts `AdvancedMarkerElement` in `1.9.0`, so this should hold — worth pinning down because the pin path changes what `content` the anchor wraps.

### Regression Tests

- existing six `asFragment()` snapshots still describe the rendered map (unit, existing)
    - **Given**: the four dimension-unit cases, the two-marker case and the current-location case already in `GoogleMap.spec.tsx`
    - **When**: the suite runs against `1.9.0`
    - **Then**: snapshots match, or differ only in ways explained by the 1.x `Map` DOM structure
    - Each snapshot diff must be read individually. `pnpm run test -u` is acceptable only after the diff has been reviewed and the change attributed to the library.

- marker `onClick` still fires for image markers (unit)
    - **Given**: a marker with `url` and an `onClick` handler
    - **When**: the marker is clicked
    - **Then**: the handler is called once
    - Covers `AdvancedMarkerEventProps` surviving the major bump.

- map camera still fits bounds to all markers (unit)
    - **Given**: two markers at different coordinates and `autoZoom: true`
    - **When**: the map renders
    - **Then**: `fitBounds` is called on the map instance; with `autoZoom: false`, `setCenter` is called instead
    - Covers the imperative `useMap()` block in `src/components/GoogleMap.tsx:57-78`, which is the part most exposed to the 1.x controlled/uncontrolled camera rework.

- full widget suite passes unchanged (unit, existing)
    - **Given**: the 90 tests across 12 suites currently green
    - **When**: `pnpm run test` runs after the bump
    - **Then**: all pass; Leaflet, model-layer and util suites are untouched by this change

- `tsc --noEmit` reports no errors (type check)
    - **Given**: `@types/google.maps` moves from `^3.54.10` to `^3.64.0`
    - **When**: the type check runs
    - **Then**: clean — `GoogleMap.tsx` only uses `LatLngLiteral` and `LatLngBounds`

## Notes

**Why the reproduction is deterministic in jsdom.** `@googlemaps/jest-mocks@2.22.8` already models the Maps API 3.62+ world:

- `PinElement extends HTMLElement` and is registered with `customElements.define("gmp-pin", PinElement)`, so `1.9.0`'s capability check `customElements.get("gmp-pin") !== undefined` returns true and the `PinModern` branch runs under test.
- `importLibrary` is a `jest.fn` whose `"marker"` case returns `{ PinElement, AdvancedMarkerElement, ... }`, so `useMapsLibrary("marker")` resolves. Without this, `1.9.0`'s `Pin` returns `null` and every pin assertion would pass vacuously.
- The mocked `PinElement` has no `element` property, which is exactly what makes the `0.8.3` behaviour observably broken rather than merely deprecated.

**Guard against vacuous passes.** `1.9.0`'s `Pin` returns `null` until the marker library resolves. Any pin test must therefore flush promises inside `act` and assert on a _positive_ signal (instance constructed and connected), never on absence of an error. A pin test that passes while `mockInstances.get(PinElement)` is empty is not testing anything.

**Where to assert.** Prefer `mockInstances` from `@googlemaps/jest-mocks` over DOM queries. `AdvancedMarkerElement` is itself a mocked custom element whose `content` is assigned as a property, so pin markup may not surface in `asFragment()` output at all. If it does not appear in snapshots, that is expected and not a defect — assert via the instance registry.

**Ordering.** Write the two reproduction tests first and confirm they fail on `0.8.3` before changing `package.json`. Skipping the red step forfeits the only automated proof that the bump fixes anything.

**Out of scope.** Pinning `APIProvider version`, replacing `<Pin />` with hand-rolled SVG markers, and sweeping the Google path for other 3.62 deprecations were all considered and rejected for this change.

### Deviation: `isConnected` replaced by attached-pin count (task 1.4)

The reproduction test above specified `isConnected === true` and `mockInstances.get(PinElement)` having length 1. Running the red step showed both to be wrong:

```
● attaches a pin for a marker without a custom image
    Expected length: 1
    Received length: 2
    Received array:  [<gmp-pin />, <gmp-pin />]
```

vis.gl's `Pin` effect lists the props object in its dependency array, and that object has a fresh identity on every render. One default marker therefore constructs one `PinElement` **per render**, so an exact instance count asserts render count rather than behaviour.

`isConnected` is also wrong: the mocked `AdvancedMarkerElement` is never attached to the rendered document — vis.gl assigns its `content` as a detached DOM subtree — so `isConnected` is `false` even on `1.9.0`.

The assertion is now "exactly one pin is _attached_ to marker content", via `attachedPins()` filtering on `parentElement !== null`. This is render-count independent because `PinModern` clears existing marker content before appending, so only the newest pin stays attached. Confirmed red on `0.8.3`:

```
● attaches a pin for a marker without a custom image
    Expected length: 1
    Received length: 0
    Received array:  []

● does not read the deprecated element property of PinElement
    Expected number of calls: 0
    Received number of calls: 2
```

The two `.element` reads correspond to the two constructed instances, confirming one deprecated access per pin construction.

### Deviation: marker clicks must be version-agnostic (tasks 1.6, 1.7)

The click mechanism is not stable across the bump, which the design did not anticipate:

|         | click wiring                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------- |
| `0.8.3` | `google.maps.event.addListener(marker, "click", onClick)` (`dist/index.modern.mjs:907`)                  |
| `1.9.0` | `useDomEventListener(marker, "gmp-click", onClick)`, i.e. native `addEventListener` (`4:2217`, `4:2013`) |

A click test written against either mechanism alone passes on one version and fails on the other, which would destroy the regression signal for tasks 1.6 and 1.7 — the test and the library would change together, proving nothing.

The spec therefore has a `clickMarker()` helper that fires **both**: it invokes the most recently registered `google.maps.event.addListener(marker, "click")` handler _and_ dispatches a native `gmp-click` event. Only one mechanism is ever registered by a given version, so the other path is a no-op. The "most recent handler" detail matters because `AdvancedMarker`'s event effect lists `onClick` in its dependency array and `GoogleMapsMarker` passes an inline arrow, so the listener is re-registered on every render; earlier handlers were already removed by `clearInstanceListeners`.

Once on `1.9.0`, the `google.maps.event` half of the helper is dead code and should be dropped in the refactor phase (folded into task 3.1).

### Deviation: marker markup is asserted through `marker.content`, not the document

`AdvancedMarker` portals its children into a `div` it assigns to `marker.content`, which is never attached to the rendered document. Confirmed by the existing six snapshots: none contains `img` markup even though every existing fixture is an image marker. DOM queries (`getByRole("img")`) and `asFragment()` therefore cannot see marker content at all.

Image assertions go through `markerImages()`, which walks `marker.content` on markers still attached to the map (`marker.map` truthy, since vis.gl nulls it on cleanup). Info window assertions read the `textContent` of the container passed to `InfoWindow.setContent` — both `0.8.3` and `1.9.0` construct `google.maps.InfoWindow` and call `setContent` with a portal container, so this is version-stable. The container's text is read at assertion time rather than at call time, because `setContent` receives the element while it is still empty.

### Red/green split confirmed on `0.8.3`

Of the eleven tests now in the spec, exactly the four pin-dependent ones fail, and they are the four the bump is meant to fix:

```
Tests: 4 failed, 11 passed
● default pin markers › attaches a pin for a marker without a custom image
● default pin markers › does not read the deprecated element property of PinElement
● default pin markers › attaches a pin for the current location marker when it has no image
● custom image markers › renders a pin for the default marker and an image for the custom marker
```

The image-marker, info-window, `onClick` and camera tests pass on `0.8.3` and must stay green after the bump — that is their entire purpose. Notably `fitBounds` / `setCenter` are mutually exclusive on `0.8.3` (`Map` does not call `setCenter` internally when `autoZoom` is on), so the negative assertion is safe to keep and will catch the 1.x camera rework if it changes that.

### Deviation: `google.maps.Settings` must be stubbed in the spec

`1.9.0`'s `APIProvider` calls `google.maps.Settings.getInstance()` once the API reports loaded (`src/components/api-provider.tsx:389`), in order to attach `fetchAppCheckToken`. `@googlemaps/jest-mocks@2.22.8` never creates `google.maps.Settings` — `initialize()` only preserves one if it already exists — so every render threw `TypeError: Cannot read properties of undefined (reading 'getInstance')`.

Stubbed in `GoogleMap.spec.tsx`'s `beforeEach` with a `getInstance` returning an empty object. This is a gap in the mock library, not a widget defect, and the widget never passes `fetchAppCheckToken`. `MapsWidget.spec.tsx` needs no stub: it never calls `initialize()`, so the API never reports loaded and the effect never runs.

### Deviation: the bump breaks the build, and the fix is not in `src/`

The proposal expected no changes beyond `package.json`, the lockfile and the spec. That was wrong. After the bump, `pnpm run build` fails:

```
src/components/GoogleMap.tsx (37:27): @rollup/plugin-typescript TS2503: Cannot find namespace 'google'.
```

Verified this is caused by the bump and not pre-existing: reverting to `^0.8.3`, reinstalling and rebuilding succeeds, then restoring `^1.9.0` reproduces the failure.

Cause is a packaging change, not an API change. `0.8.3` shipped unbundled declarations — dozens of `.d.ts` files, one of which carried `/// <reference types="google.maps" />`. That reference leaked the `google` global namespace into the widget's own compilation, which is how `GoogleMap.tsx` got away with using `google.maps.LatLngLiteral` and `google.maps.LatLngBounds` while `tsconfig.json` restricted `types` to `["jest", "node"]`. `1.9.0` ships a single bundled `dist/index.d.ts` with no such reference, so the global vanished.

The widget was therefore relying on an accidental transitive type reference. Fixed by declaring the dependency it always had:

- `package.json` — add `@types/google.maps` `^3.64.0` to `devDependencies` (the version `1.9.0` itself depends on)
- `tsconfig.json` — add `"google.maps"` to `compilerOptions.types`

`src/` is untouched, so the task 2.2 guardrail ("if production source edits are required, STOP") is not tripped. This also fixes four pre-existing `tsc --noEmit` errors — the same missing namespace in `GoogleMap.tsx:37`, `GoogleMap.tsx:59` and the new spec — which failed before this change because bare `tsc` never saw the transitive reference that Rollup's build did.
