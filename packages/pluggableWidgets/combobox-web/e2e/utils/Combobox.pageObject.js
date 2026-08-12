export default class Combobox {
    constructor(locator) {
        this.locator = locator;
    }

    async open() {
        await this.locator.locator(".widget-combobox").click();
    }

    async close() {
        await this.locator.page().keyboard.press("Escape");
    }

    getFilterInput() {
        return this.locator.locator("input");
    }

    getMenu() {
        return this.locator.locator(".widget-combobox-menu").first();
    }

    getOptions() {
        return this.locator.locator("[role=listbox] [role=option]");
    }

    getOptionByText(text) {
        return this.getOptions().filter({ hasText: text });
    }

    getSelectedText() {
        return this.locator.locator(".widget-combobox-placeholder-text");
    }

    async filter(text) {
        await this.getFilterInput().fill(text);
    }

    isOpen() {
        return this.getMenu().isVisible();
    }

    async selectOption(text) {
        if (!(await this.isOpen())) {
            await this.open();
        }
        await this.getOptionByText(text).click({ delay: 10 });
    }

    async clear() {
        await this.locator.locator(".widget-combobox-clear-button").first().click();
    }

    async removeSelectedOption(index = 0) {
        await this.locator.locator(".widget-combobox-icon-container").nth(index).click();
    }
}
