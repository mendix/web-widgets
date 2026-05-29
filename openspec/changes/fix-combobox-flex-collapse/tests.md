## Tests

- [ ] **Combobox root element has min-width: 15ch in stylesheet**
    - **Type:** unit
    - **Given:** Combobox.scss source
    - **When:** `.widget-combobox` rule is inspected
    - **Then:** `min-width` is `15ch`
    - **Status:** needs update — `src/__tests__/ComboboxStyles.spec.ts` currently asserts `min-content`

- [ ] **Single-select combobox renders with visible width in flex container with align-items center**
    - **Type:** e2e
    - **Given:** Single-select Combobox on page `/p/combobox-flex-layout` (`.mx-name-comboBoxFlexSingle`)
    - **When:** Page loads with no interaction
    - **Then:** Combobox bounding rect width is greater than 10px
    - **Status:** pending — needs test page in Studio Pro

- [ ] **Multiselect combobox renders with visible width in flex container with align-items center**
    - **Type:** e2e
    - **Given:** Multiselect Combobox on page `/p/combobox-flex-layout` (`.mx-name-comboBoxFlexMulti`)
    - **When:** Page loads with no interaction
    - **Then:** Combobox bounding rect width is greater than 10px
    - **Status:** pending — needs test page in Studio Pro

- [x] **Multiselect inactive input still collapses to 1px (intentional behavior preserved)**
    - **Type:** unit
    - **Given:** Combobox.scss source
    - **When:** multiselect inactive rule inspected
    - **Then:** `.widget-combobox-input` has `width: 1px`
    - **Status:** done — `src/__tests__/ComboboxStyles.spec.ts`
