# Mendix Widget Development Rules

## API Guards

- ALWAYS check `actionValue.canExecute` before calling `execute()`
- NEVER render widget content while value status is `"loading"` — show loading/placeholder state instead
- Use `editableValue.setValue()` for two-way binding, never mutate the value directly
- Handle all three `EditableValue` states: `"available"`, `"loading"`, `"unavailable"`

## XML ↔ TypeScript

- XML property keys MUST be lowerCamelCase and MUST match TypeScript prop names exactly
- When adding an XML property: update `<Widget>.xml`, rebuild to regenerate `typings/<Widget>Props.d.ts`, update `editorConfig.ts`, and `editorPreview.tsx`
- Each widget MUST have a unique widget ID in `package.xml` — never duplicate across widgets

## Versioning

- Any change to runtime behavior, XML schema, or public API REQUIRES:
    - Semver bump in `package.json`
    - CHANGELOG.md entry (Keep a Changelog format)
    - Run `pnpm -w changelog` or update manually
- Refactor, test, or docs-only changes: no bump required

## Styling

- SCSS only — no inline styles for static design
- Prefer Atlas UI classes (`btn`, `btn-primary`, `badge`, etc.) for common elements
- Custom classes MUST use the widget-name prefix: `.widget-<name>-<element>`
- NEVER override core Atlas UI classes — wrap in a widget-specific selector if custom styling is needed

## Testing

- Run tests from the widget package dir: `cd packages/pluggableWidgets/<name>-web && pnpm test`
- Use `@mendix/widget-plugin-test-utils` builders for mocking Mendix API values:
    ```ts
    import { dynamicValue, EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
    const mockAttr = new EditableValueBuilder<string>().withValue("test").build();
    ```
- New features require unit tests; bug fixes require regression tests
- User-visible behavior changes require E2E updates in `e2e/*.spec.js`
- E2E tests MUST include `test.afterEach` session logout to avoid Mendix license limit issues

## Constraints

- Never modify `dist/`, generated typings, or `pnpm-lock.yaml`
- No tree-shaking-hostile imports — use named imports for large dependencies
- No core Atlas class overrides
- `dangerouslySetInnerHTML` is forbidden unless the content is explicitly sanitized
