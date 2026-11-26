/**
 * The state modifier classes of the released widget. Each one is emitted next to the data
 * attribute that carries the same state, so app CSS written against a modifier keeps matching;
 * the widget's own SCSS targets the attributes only. Whether and when the modifiers go is a
 * separate, announced decision; until then they are part of the widget's markup.
 */
export const legacy = Object.freeze({
    containerOpen: "widget-combobox-input-container-active",
    containerDisabled: "widget-combobox-input-container-disabled",
    containerHasSelection: "widget-combobox-multiselect",
    selectedItemsBoxes: "widget-combobox-boxes",
    selectedItemsText: "widget-combobox-text",
    selectedItemsCustom: "widget-combobox-custom-content",
    inputReadonly: "widget-combobox-input-nofilter",
    placeholderCustom: "widget-combobox-placeholder-custom",
    placeholderEmpty: "widget-combobox-placeholder-empty",
    toggleIconOpen: "active",
    menuHidden: "widget-combobox-menu-hidden",
    menuListLazy: "widget-combobox-menu-lazy-scroll",
    menuListHighlighted: "widget-combobox-menu-highlighted",
    itemSelected: "widget-combobox-item-selected",
    itemHighlighted: "widget-combobox-item-highlighted",
    selectAllDisabled: "widget-combobox-menu-header-select-all-button-disabled",
    /** The chip remove control shared the clear button's class before it got its own. */
    chipRemove: "widget-combobox-clear-button",
    spinnerMargins: "widget-combobox-spinner-margin",
    spinnerSmall: "widget-combobox-spinner-loader-small",
    skeletonSmall: "widget-combobox-skeleton-loader-small"
});
