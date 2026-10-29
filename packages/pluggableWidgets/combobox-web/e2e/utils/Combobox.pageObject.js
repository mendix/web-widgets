/**
 * Page object for one combobox widget instance.
 *
 * Locators prefer roles and ARIA attributes over widget class names, so the specs keep working
 * when the DOM classes change. The few class-based locators that remain are the ones with no
 * ARIA equivalent (chips, placeholder text, footer, select-all header).
 *
 * The filter input is addressed by `role=combobox`: a plain `input` locator also matches the
 * checkbox inside every option once a multi-select menu is open.
 */
export default class Combobox {
    constructor(locator) {
        this.locator = locator;
    }

    /** The whole widget; use for visibility checks, the input itself collapses to 0px when empty. */
    get root() {
        return this.locator;
    }

    get input() {
        return this.locator.locator("input[role=combobox]");
    }

    /** Down arrow next to the input. It has no handler of its own, so a click reaches the toggle. */
    get toggle() {
        return this.locator.locator(".widget-combobox-down-arrow");
    }

    get menu() {
        return this.locator.locator(".widget-combobox-menu").first();
    }

    get listbox() {
        return this.locator.locator("[role=listbox]").first();
    }

    get options() {
        return this.locator.locator("[role=listbox] [role=option]:not(.widget-combobox-no-options)");
    }

    get selectedOptions() {
        return this.locator.locator("[role=listbox] [role=option][aria-selected=true]");
    }

    /** Rendered instead of options when the filter matches nothing. */
    get noOptionsPlaceholder() {
        return this.locator.locator("[role=listbox] .widget-combobox-no-options");
    }

    /** Caption area of a single select, or the comma separated captions of a text style multi select. */
    get selectedText() {
        return this.locator.locator(".widget-combobox-placeholder-text");
    }

    /** Selected items of a boxes style multi select. */
    get chips() {
        return this.locator.locator(".widget-combobox-selected-item");
    }

    get clearButton() {
        return this.locator.getByRole("button", { name: "Clear selection" });
    }

    get chipRemoveButtons() {
        return this.chips.getByRole("button", { name: "Remove value" });
    }

    get footer() {
        return this.locator.locator(".widget-combobox-menu-footer");
    }

    get selectAllCheckbox() {
        return this.locator.locator(".widget-combobox-menu-header input[type=checkbox]");
    }

    /** Rendered while the widget has no context object yet. */
    get unavailablePlaceholder() {
        return this.locator.locator(".widget-combobox-placeholder");
    }

    option(index) {
        return this.options.nth(index);
    }

    /**
     * Opens the menu and waits until the first option is rendered. The first open of a lazy loading
     * combobox shows a spinner while the options load; keys pressed in that window act on an empty
     * list and are lost. Use `toggle.click()` directly for a combobox that has no options at all.
     */
    async open() {
        await this.toggle.click({ delay: 10 });
        // "attached", not "visible": the input is 0px wide while empty, and always when filtering is off.
        await this.locator.locator("input[role=combobox][aria-expanded=true]").waitFor({ state: "attached" });
        await this.options.first().waitFor({ state: "attached" });
    }

    async close() {
        await this.locator.page().keyboard.press("Escape");
    }

    getFilterInput() {
        return this.input;
    }

    getMenu() {
        return this.menu;
    }

    getOptions() {
        return this.options;
    }

    getOptionByText(text) {
        return this.options.filter({ hasText: text });
    }

    getSelectedText() {
        return this.selectedText;
    }

    async filter(text) {
        await this.input.fill(text);
    }

    isOpen() {
        return this.menu.isVisible();
    }

    async selectOption(text) {
        if (!(await this.isOpen())) {
            await this.open();
        }
        await this.getOptionByText(text).click({ delay: 10 });
    }

    async clear() {
        await this.clearButton.click();
    }

    async removeSelectedOption(index = 0) {
        await this.chipRemoveButtons.nth(index).click();
    }
}
