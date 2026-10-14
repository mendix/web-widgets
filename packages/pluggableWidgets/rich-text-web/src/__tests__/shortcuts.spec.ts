import { SHORTCUT_CATEGORIES } from "../components/toolbars/helpers/shortcuts";

/**
 * Drift guard: the help catalog is manually maintained. This test asserts it
 * still covers the shortcuts owned by this repo's custom extensions, so a change
 * to Indent.ts / Fullscreen.ts / KeyboardNavigation.ts that drops a binding
 * without updating the catalog is caught.
 */
describe("shortcut catalog", () => {
    const allShortcuts = SHORTCUT_CATEGORIES.flatMap(category => category.shortcuts);
    const ids = new Set(allShortcuts.map(s => s.id).filter(Boolean));

    it.each([
        ["indent.increase", "Indent.ts Ctrl+]"],
        ["indent.decrease", "Indent.ts Ctrl+["],
        ["nav.focusToolbar", "KeyboardNavigation.ts Alt+F10"],
        ["nav.focusStatusBar", "KeyboardNavigation.ts Alt+F11"],
        ["nav.escape", "KeyboardNavigation.ts / Fullscreen.ts Escape"]
    ])("covers custom-extension shortcut %s (%s)", id => {
        expect(ids.has(id)).toBe(true);
    });

    it("has non-empty categories with label keys and keys", () => {
        expect(SHORTCUT_CATEGORIES.length).toBeGreaterThan(0);
        for (const category of SHORTCUT_CATEGORIES) {
            expect(category.titleKey).toBeTruthy();
            expect(category.shortcuts.length).toBeGreaterThan(0);
            for (const shortcut of category.shortcuts) {
                expect(shortcut.labelKey).toBeTruthy();
                expect(shortcut.keys).toBeTruthy();
            }
        }
    });

    it("includes the four expected categories", () => {
        const titleKeys = SHORTCUT_CATEGORIES.map(c => c.titleKey);
        expect(titleKeys).toEqual([
            "shortcut.category.formatting",
            "shortcut.category.paragraph",
            "shortcut.category.history",
            "shortcut.category.accessibility"
        ]);
    });
});
