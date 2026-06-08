## Context

ValidationAlert is a shared component in `@mendix/widget-plugin-component-kit` used by 5+ widgets to display validation messages. Currently, the `id` prop is optional, leading to inconsistent ARIA implementation. Some widgets (combobox, checkbox-radio-selection) properly connect validation via `aria-describedby`, while others (slider, range-slider, rich-text) render ValidationAlert without IDs, breaking screen reader accessibility.

WCAG 2.2 AA requires form inputs to be programmatically associated with their error messages. Without IDs, screen readers cannot announce validation errors when users focus invalid fields.

## Goals / Non-Goals

**Goals:**

- Make ValidationAlert ID prop required at compile time (TypeScript)
- Update all affected widgets to provide proper IDs and connect them via ARIA attributes
- Establish consistent validation ID naming convention across widgets
- Maintain backward compatibility for widgets already using IDs correctly

**Non-Goals:**

- Runtime enforcement or validation checking (TypeScript-only enforcement)
- Automatic ID generation (widgets must explicitly provide IDs)
- Changes to ValidationAlert visual styling or behavior
- Enforcement for non-widget code using ValidationAlert

## Decisions

### Decision 1: Required prop via TypeScript interface

**Choice:** Change `ValidationAlertProps.id` from `id?: string` to `id: string` (remove optional modifier)

**Rationale:** TypeScript provides compile-time enforcement without runtime overhead. Widgets that don't provide IDs will fail to compile, preventing the issue from reaching production.

**Alternatives considered:**

- Runtime error on missing ID: Rejected - breaks production apps immediately, too risky for breaking change
- Console warning only: Rejected - easy to miss, doesn't prevent deployment
- ESLint rule: Rejected - not as reliable as type system, requires separate tooling

### Decision 2: Centralized ID helper utility

**Choice:** Export `getValidationErrorId(inputId?: string): string | undefined` from `@mendix/widget-plugin-component-kit`. Returns `${inputId}-validation-message` or undefined.

**Rationale:**

- Consistent naming convention across all widgets
- Already partially exists in combobox (proven pattern)
- Type-safe (returns undefined when input is undefined)
- Simple implementation, easy to test

**Alternatives considered:**

- Each widget generates own IDs: Rejected - inconsistent conventions
- UUID-based IDs: Rejected - not human-readable, harder to debug
- Component-level auto-generation: Rejected - breaks explicit connection requirement

### Decision 3: Widget migration strategy

**Choice:** Update widgets in dependency order:

1. `widget-plugin-component-kit` - update ValidationAlert interface + add helper
2. Widgets already using IDs (combobox, checkbox-radio-selection) - switch to helper function
3. Widgets without IDs (slider, range-slider, rich-text) - add ID prop + ARIA attributes

**Rationale:** Minimizes breaking changes by updating the shared component first, then migrating widgets incrementally. Widgets already using IDs get easy refactor to helper function before breaking change lands.

**Alternatives considered:**

- All-at-once update: Rejected - risky, hard to review
- Gradual deprecation: Rejected - leaves accessibility broken for too long

## Risks / Trade-offs

### Risk: Breaking change impacts external consumers

If teams outside web-widgets use ValidationAlert directly, their builds will break.

**Mitigation:**

- Search codebase for ValidationAlert usage before merging
- Add migration notes to CHANGELOG
- Consider major version bump for widget-plugin-component-kit
- Provide clear error message: "ValidationAlert requires 'id' prop for ARIA accessibility"

### Risk: Inconsistent input IDs across widgets

Some widgets may not have stable input IDs, making validation ID generation unreliable.

**Mitigation:**

- All Mendix widgets already receive `id` prop from platform (widget instance ID)
- Document requirement that input elements use `{props.id}` as their ID
- Helper function handles undefined gracefully (returns undefined, no error)

### Trade-off: Required prop vs gradual adoption

Making ID required forces immediate action from all widgets. This is intentional - accessibility bugs should not be optional to fix.

**Accepted:** Short-term friction for long-term correctness is the right choice for accessibility requirements.

## Migration Plan

### Phase 1: Update shared component (widget-plugin-component-kit)

1. Add `getValidationErrorId` helper to exports
2. Change `id?: string` to `id: string` in ValidationAlertProps
3. Update package version (consider semver MAJOR)
4. Run tests for Alert component

### Phase 2: Update widgets with existing IDs (non-breaking)

1. combobox-web: Switch to `getValidationErrorId` helper
2. checkbox-radio-selection-web: Switch to helper
3. Verify ARIA connections still work
4. Run widget-specific tests

### Phase 3: Fix widgets without IDs (now broken by Phase 1)

1. slider-web: Add `id={getValidationErrorId(props.id)}` to ValidationAlert, add `aria-invalid` and `aria-describedby` to slider handle
2. range-slider-web: Consolidate to single ValidationAlert with `id={getValidationErrorId(props.id)}`, both handles reference same validation message via `aria-describedby`
3. rich-text-web: Add ID and ARIA attributes to editor wrapper
4. Run E2E accessibility tests for each widget

### Phase 4: Documentation

1. Update frontend-guidelines.md with validation connection requirements
2. Add example to widget template/scaffold
3. Document helper function in widget-plugin-component-kit README

### Rollback Strategy

If critical issues found after merge:

1. Revert widget-plugin-component-kit to make `id` optional again
2. Keep helper function (non-breaking)
3. Keep widget fixes (they work with optional ID)
4. Re-evaluate approach

## Open Questions

1. Should we add E2E tests that verify ARIA connections in each widget's test suite?
    - Leaning yes - ensures validation stays connected across refactors

2. Should getValidationErrorId be widget-specific or centralized?
    - Decision: Centralized (as proposed) for consistency

3. Do we need TypeScript tests to verify the type error occurs when ID is missing?
    - Leaning no - TypeScript compilation itself is the test
