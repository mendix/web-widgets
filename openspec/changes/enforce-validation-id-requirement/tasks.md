## 1. Update Shared Component (widget-plugin-component-kit)

- [ ] 1.1 Export getValidationErrorId helper function in Alert.tsx (takes inputId?: string, returns "${inputId}-validation-message" or undefined)
- [ ] 1.2 Add unit tests for getValidationErrorId helper (test normal ID, undefined ID, empty string)
- [ ] 1.3 Change ValidationAlertProps interface: id?: string → id: string (make required)
- [ ] 1.4 Verify existing Alert tests still pass with required ID
- [ ] 1.5 Update widget-plugin-component-kit package version (consider semver implications)

## 2. Update Combobox Widget (Already Has IDs)

- [ ] 2.1 Import getValidationErrorId from @mendix/widget-plugin-component-kit
- [ ] 2.2 Replace manual ID generation with getValidationErrorId(options.inputId) in SingleSelection
- [ ] 2.3 Replace manual ID generation with getValidationErrorId(options.inputId) in MultiSelection
- [ ] 2.4 Verify aria-describedby and aria-invalid still work correctly
- [ ] 2.5 Run combobox unit tests to ensure no regressions
- [ ] 2.6 Run combobox E2E tests to verify validation display

## 3. Update Checkbox-Radio-Selection Widget (Already Has IDs)

- [ ] 3.1 Import getValidationErrorId from @mendix/widget-plugin-component-kit
- [ ] 3.2 Replace manual ID generation with getValidationErrorId in CheckboxSelection component
- [ ] 3.3 Replace manual ID generation with getValidationErrorId in RadioSelection component
- [ ] 3.4 Verify aria-describedby and aria-invalid still work correctly
- [ ] 3.5 Run checkbox-radio-selection unit tests to ensure no regressions
- [ ] 3.6 Run checkbox-radio-selection E2E tests to verify validation display

## 4. Fix Slider Widget (Missing IDs)

- [ ] 4.1 Import getValidationErrorId from @mendix/widget-plugin-component-kit
- [ ] 4.2 Update Slider.tsx: pass id={getValidationErrorId(props.id)} to ValidationAlert
- [ ] 4.3 Add aria-invalid attribute to slider handle when validation exists
- [ ] 4.4 Add aria-describedby={getValidationErrorId(props.id)} to slider handle when validation exists
- [ ] 4.5 Write unit tests verifying ARIA attributes are set when validation exists
- [ ] 4.6 Write unit tests verifying ARIA attributes are removed when validation clears
- [ ] 4.7 Run slider widget tests to ensure no regressions
- [ ] 4.8 Manually test slider validation in test project

## 5. Fix Range Slider Widget (Missing IDs - Consolidate Validations)

- [ ] 5.1 Import getValidationErrorId from @mendix/widget-plugin-component-kit
- [ ] 5.2 Determine which validation to display (lowerBoundAttribute.validation || upperBoundAttribute.validation)
- [ ] 5.3 Replace two ValidationAlert components with single ValidationAlert using id={getValidationErrorId(props.id)}
- [ ] 5.4 Add aria-invalid to both slider handles when any validation exists
- [ ] 5.5 Add aria-describedby={getValidationErrorId(props.id)} to both slider handles when validation exists
- [ ] 5.6 Write unit tests verifying both handles reference same validation message ID
- [ ] 5.7 Write unit tests verifying ARIA attributes are set when either bound has validation
- [ ] 5.8 Run range slider widget tests to ensure no regressions
- [ ] 5.9 Manually test range slider validation in test project

## 6. Fix Rich Text Widget (Missing IDs)

- [ ] 6.1 Import getValidationErrorId from @mendix/widget-plugin-component-kit
- [ ] 6.2 Update RichText.tsx: pass id={getValidationErrorId(props.id)} to ValidationAlert
- [ ] 6.3 Identify the rich text editor's input element/container
- [ ] 6.4 Add aria-invalid attribute to editor when stringAttribute.validation exists
- [ ] 6.5 Add aria-describedby={getValidationErrorId(props.id)} to editor when validation exists
- [ ] 6.6 Write unit tests verifying ARIA attributes on editor element
- [ ] 6.7 Run rich text widget tests to ensure no regressions
- [ ] 6.8 Manually test rich text validation in test project

## 7. Integration Testing

- [ ] 7.1 Build all affected widgets (combobox, checkbox-radio-selection, slider, range-slider, rich-text)
- [ ] 7.2 Test in Studio Pro project: verify validation messages appear visually
- [ ] 7.3 Test with screen reader (VoiceOver/NVDA): verify validation messages are announced on focus
- [ ] 7.4 Verify development console warnings appear for any remaining unconnected validations
- [ ] 7.5 Verify no console warnings in production build
- [ ] 7.6 Run full monorepo test suite to check for unexpected breakages

## 8. Documentation

- [ ] 8.1 Update docs/requirements/frontend-guidelines.md: add section on validation ARIA requirements
- [ ] 8.2 Document getValidationErrorId helper in widget-plugin-component-kit README
- [ ] 8.3 Add example of proper ValidationAlert usage with ID and ARIA connection
- [ ] 8.4 Update CHANGELOG.md for widget-plugin-component-kit (BREAKING: ValidationAlert id prop now required)
- [ ] 8.5 Update CHANGELOG.md for each affected widget (accessibility: connect validation to inputs via ARIA)
- [ ] 8.6 Consider adding validation connection example to widget template/scaffold
