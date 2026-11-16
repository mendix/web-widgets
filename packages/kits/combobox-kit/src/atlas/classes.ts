/**
 * The class names of the Atlas View, one per element it renders. The values are the names the
 * released widget always had, so app CSS that targets an element keeps matching. State is not a
 * class: it is a data attribute next to the class, `widget-combobox-item[data-highlighted]`
 * next to `widget-combobox-item-highlighted`; the old modifier classes are still emitted, see
 * legacyModifiers.ts. The View takes overrides per key through its `classes`
 * prop and the parts read the result through `useComboboxClasses`. See
 * docs/design/headless-combobox.md, section 6.
 */
export type ComboboxClassKey =
    | "root"
    | "inputContainer"
    | "selectedItems"
    | "input"
    | "placeholder"
    | "caption"
    | "customContent"
    | "chip"
    | "chipRemove"
    | "clear"
    | "clearIcon"
    | "toggle"
    | "toggleIcon"
    | "icon"
    | "menu"
    | "menuHeader"
    | "selectAll"
    | "menuList"
    | "menuItem"
    | "noOptions"
    | "menuFooter"
    | "skeleton"
    | "skeletonBar"
    | "spinner"
    | "spinnerIcon";

export type ComboboxClasses = Readonly<Record<ComboboxClassKey, string>>;

export function comboboxClasses(prefix = "widget-combobox"): ComboboxClasses {
    return Object.freeze({
        root: prefix,
        inputContainer: `${prefix}-input-container`,
        selectedItems: `${prefix}-selected-items`,
        input: `${prefix}-input`,
        placeholder: `${prefix}-placeholder-text`,
        caption: `${prefix}-caption-text`,
        customContent: `${prefix}-caption-custom`,
        chip: `${prefix}-selected-item`,
        chipRemove: `${prefix}-selected-item-remove-button`,
        clear: `${prefix}-clear-button`,
        clearIcon: `${prefix}-clear-button-icon`,
        toggle: `${prefix}-down-arrow`,
        toggleIcon: `${prefix}-down-arrow-icon`,
        icon: `${prefix}-icon-container`,
        menu: `${prefix}-menu`,
        menuHeader: `${prefix}-menu-header`,
        selectAll: `${prefix}-menu-header-select-all-button`,
        menuList: `${prefix}-menu-list`,
        menuItem: `${prefix}-item`,
        noOptions: `${prefix}-no-options`,
        menuFooter: `${prefix}-menu-footer`,
        skeleton: `${prefix}-skeleton`,
        skeletonBar: `${prefix}-skeleton-loader`,
        spinner: `${prefix}-spinner`,
        spinnerIcon: `${prefix}-spinner-loader`
    });
}

/** The Atlas class map, the default of the View's `classes` prop. */
export const defaultClasses = comboboxClasses();
