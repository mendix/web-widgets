## Context

A published pluggable widget carries two overlapping sets of strings, and a rename is only safe if they are told apart:

- **Identity** — resolved by Studio Pro and the Mendix Client at load time, and baked into every `.mpr` that already
  uses the widget: the XML `id`, `package.xml`'s `clientModule name` / `widgetFile path` / `file path`, `package.json`'s
  `widgetName` / `mxpackage.name` / `mpkName` / `packagePath`, the folder + npm package name, and — for anyone who wrote
  custom CSS — the `widget-checkbox-radio-selection*` class prefix. `marketplace.appNumber` (245825) is the listing's
  identity.
- **Presentation** — strings a developer reads: XML `<name>` and `<description>`, property captions/descriptions, editor
  dropzone placeholders, design-time empty-caption fallbacks, `marketplace.appName`, `README.md`.

WC-3223 changes presentation only. Two facts shape the work:

1. The `<name>` today is `Check box / radio selector`, not "Checkbox Radio Selection" — the latter only appears in
   `marketplace.appName`, README, and design-time fallback captions. So there are two old spellings to sweep, not one.
2. `<description />` is **empty**. The discoverability requirement ("must still mention checkbox and radio button")
   therefore means _adding_ a description, not editing one — this is the only genuinely new content in the change.

The generated typings filename derives from `widgetName` (via the XML _filename_), not from `<name>`, so a
display-name rename leaves `typings/CheckboxRadioSelectionProps.d.ts` and all `CheckboxRadioSelection.*` source
filenames alone. That is what makes this change cheap.

## Goals / Non-Goals

**Goals:**

- Studio Pro toolbox and Marketplace show "Option Selector".
- Searching the toolbox or Marketplace for "checkbox" or "radio" still surfaces the widget.
- Zero upgrade impact: an app on the current version can drop in the renamed MPK and nothing breaks — no page
  re-configuration, no CSS rewrite.
- Sweep _both_ old spellings out of user-visible copy so nothing reads as half-renamed.

**Non-Goals:**

- Renaming the folder, npm package, `widgetName`, widget ID, mpk name, or CSS classes.
- Renaming the docs-site page or changing `<helpUrl>` (`/appstore/widgets/checkboxradioselection` stays).
- Renaming e2e locators (`.mx-name-checkboxRadioSelection*`), the `/p/checkboxradioselection` test page, or the
  screenshot baselines — those live in the external `mendix/testProjects` branch, not this repo.
- Any version bump — release automation owns versions.
- Any behavior, prop, or styling change.

## Decisions

**Display-name-only rename, identity frozen.** The alternative — renaming folder, npm package, and `widgetName` to
`option-selector-web` / `OptionSelector` — would give internal consistency, but changing `widgetName` changes the XML
filename, which changes the widget ID resolution path and the mpk name. Every existing app referencing the old ID would
fail to load the widget. Rejected: internal tidiness is not worth breaking published apps. The cost we accept is a
permanent mismatch between the folder name and the product name, which is already normal in this repo (`gallery-web`,
`combobox-web` all carry historical names).

**Keep `<helpUrl>` and the docs slug.** A doc URL is a public contract shared with the product (Studio Pro's help
button). Retitling a docs page is free; moving its URL requires a redirect and a product-side update. Since docs are out
of scope here, the slug stays and the page — when written — will be titled "Option Selector" while living at the old
URL. Precedent in the docs repo: `combobox.md` is titled "Combo Box"; `htmlelement.md` is titled "HTML Element".

**Description carries the keywords, not the name.** Toolbox search matches on name _and_ description. Rather than
contorting the name into "Option Selector (checkbox / radio)", the short name stays clean and the description does the
discoverability work by naming both control types explicitly.

**Rename design-time fallback captions too.** `helpers/utils.ts`'s `emptyStringFormat` and
`PreviewCaptionsProvider.emptyCaption` are what a developer sees in the structure preview when no caption is configured.
They are presentation, not identity, so they move to "Option Selector". Leaving them would show the old name inside the
page editor even after the toolbox is renamed.

**Marketplace listing updated in place.** `appNumber` 245825 is unchanged, so `rui-publish-marketplace` posts a new
version to the same listing with `Name: appName`. This preserves ratings, download counts, and inbound links. No new
listing is created.

## Risks / Trade-offs

- **Developers can't find the widget under the old name after upgrading** → the description keeps "checkbox" and "radio
  button", and the CHANGELOG `Changed` entry states the rename explicitly so it appears in release notes.
- **Half-renamed copy: one old spelling missed somewhere visible** → verification includes a case-insensitive grep for
  both `checkbox radio selection` _and_ `check box / radio selector` across `src/`, `README.md`, and `package.json`,
  expecting zero hits outside historical CHANGELOG entries.
- **Accidental identity change slipping in** (e.g. an over-eager find/replace touching `widgetName`) → verification
  asserts `git diff typings/` is empty and that the generated locale filename still contains
  `com.mendix.widget.web.checkboxradioselection.checkboxradioselection`. Both only stay stable if identity was untouched.
- **Changing the `readOnlyStyle` description changes a translation key** in
  `dist/locales/en-US/…json` (keys are the English source strings). Any existing translation of that one string is
  orphaned. Accepted: `prebuild` (`rui-create-translation`) regenerates the file, and this widget has only the `en-US`
  locale.
- **Folder/package name now diverge from the product name**, so future contributors must grep for
  `checkbox-radio-selection` when looking for "Option Selector" → the new `widget-identity` spec records the mapping,
  and the README states the package name under the new title.

## Migration Plan

No runtime migration. Rollout is the normal widget release path: merge → release automation bumps the version and opens
the "Option Selector v1.1.x: Update changelog" PR → `rui-publish-marketplace` updates listing 245825's title and
publishes the MPK. Rollback is a plain revert of the presentation strings; because identity never changed, no app is
left in a broken intermediate state either way.

## Open Questions

- Exact `<description>` wording (must contain "checkbox" and "radio button") — decided during implementation.
- Whether the docs-site page gets created in the same sprint or later; the `<helpUrl>` currently points at a page that
  does not exist yet in the docs repo. Out of scope here, worth flagging to the docs owner.
