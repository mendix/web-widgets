/**
 * Page Object Model for the datagrid-web widget E2E tests.
 *
 * A `DataGridPage` wraps a single Data Grid instance (identified by its
 * Mendix `mx-name`) and exposes the locators and actions the specs need,
 * so tests read as behavior rather than raw selectors.
 *
 * Navigation relies on the custom fixture, which auto-waits for the Mendix
 * app to be ready after every `page.goto()` — no manual `waitForMendixApp`.
 */
export class DataGridPage {
    /**
     * @param {import("@playwright/test").Page} page
     * @param {string} [name="datagrid1"] the grid's mx-name (without the `.mx-name-` prefix)
     */
    constructor(page, name = "datagrid1") {
        this.page = page;
        this.name = name;
        this.root = page.locator(`.mx-name-${name}`);
    }

    /** Navigate to a page; the fixture auto-waits for Mendix readiness. */
    async open(path = "/") {
        await this.page.goto(path);
    }

    // --- Columns & headers -------------------------------------------------

    get columnHeaders() {
        return this.root.locator(".column-header");
    }

    columnHeader(n) {
        return this.columnHeaders.nth(n);
    }

    /** Sort indicator icon inside a column header. */
    sortIcon(n) {
        return this.columnHeader(n).locator("svg");
    }

    /** Click a column header to cycle its sort order. */
    async sortByColumn(n) {
        await this.columnHeader(n).click();
    }

    // --- Cells & rows ------------------------------------------------------

    get cells() {
        return this.root.locator(".td");
    }

    cell(n) {
        return this.cells.nth(n);
    }

    get rows() {
        return this.root.locator('[role="row"]');
    }

    /** All gridcells in the nth column (1-based, matches `:nth-child`). */
    columnCells(n) {
        return this.root.locator(`[role="gridcell"]:nth-child(${n})`);
    }

    // --- Column selector (hide/show) ---------------------------------------

    async openColumnSelector() {
        await this.root.locator(".column-selector-button").click();
    }

    // The column-selector popover is rendered inline inside the grid root
    // (Floating UI without a portal), so scope its items to `this.root`.
    get columnSelectorItems() {
        return this.root.locator(".column-selectors > li");
    }

    columnSelectorItem(n) {
        return this.columnSelectorItems.nth(n);
    }

    get checkedColumns() {
        return this.root.locator(".column-selectors input:checked");
    }

    // --- Filters -----------------------------------------------------------

    /** A named drop-down filter widget rendered as a combobox. */
    dropdownFilter(n) {
        return this.page.locator(`.mx-name-drop_downFilter${n}[role="combobox"]`);
    }

    /** An option in an open listbox, matched by visible text. */
    option(label) {
        return this.page.locator(`[role="option"]:has-text("${label}")`);
    }

    /** Column-header-scoped filter controls (used by header-embedded filters). */
    headerCombobox(name) {
        return this.page.getByRole("columnheader", { name }).getByRole("combobox");
    }

    headerTextbox(name) {
        return this.page.getByRole("columnheader", { name }).getByRole("textbox");
    }

    /** The `.filter-container` inside the nth column header (1-based). */
    headerFilterContainer(n) {
        return this.page.locator(`[role="columnheader"]:nth-child(${n})`).locator(".filter-container");
    }

    headerFilterButton(n) {
        return this.headerFilterContainer(n).getByRole("combobox");
    }

    headerFilterOption(n, name) {
        return this.headerFilterContainer(n).getByRole("listbox").getByRole("option", { name, exact: true });
    }
}
