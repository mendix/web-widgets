import { expect, test } from "@mendix/run-e2e/fixtures";
import Combobox from "./utils/Combobox.pageObject";

// Reproduces known_issues.md: each test asserts that its issue still happens, so it is skipped by
// default. Run with COMBOBOX_KNOWN_ISSUES=1; a failing test means the issue changed or was fixed.

const describeKnownIssues = process.env.COMBOBOX_KNOWN_ISSUES ? test.describe : test.describe.skip;

async function rect(locator) {
    return locator.evaluate(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    });
}

async function textRect(locator) {
    return locator.evaluate(el => {
        const range = el.ownerDocument.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    });
}

async function isTruncated(locator) {
    const [text, box] = [await textRect(locator), await rect(locator)];
    return text.width > box.width + 0.01;
}

function log(name, values) {
    const round = v => (typeof v === "number" ? Math.round(v * 10) / 10 : v);
    console.log(
        `[${name}] ${Object.entries(values)
            .map(([k, v]) => `${k}=${round(v)}`)
            .join(" ")}`
    );
}

const column = combobox => combobox.root.locator("xpath=ancestor::div[contains(@class,'col')][1]");
const field = combobox => combobox.root.locator(".widget-combobox-input-container");

describeKnownIssues("combobox-web known layout issues", () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto("/p/combobox-layout");
        await expect(page.locator(".mx-name-comboLong")).toBeVisible({ timeout: 10000 });
    });

    test("1 a horizontal label cuts the label or the value short in parents that size to their content", async ({
        page
    }) => {
        for (const name of ["comboAutoFitLabel", "comboCenteredLabel"]) {
            const combobox = new Combobox(page.locator(`.mx-name-${name}`));
            const label = combobox.root.locator("label");
            const valueCut = await isTruncated(combobox.selectedText);
            const labelText = await textRect(label);
            const labelBox = await rect(label);
            const labelCut = labelText.width > labelBox.width + 0.01 || labelText.height > labelBox.height + 1;

            log(`1 ${name}`, { valueCut, labelCut, labelBox: labelBox.width, labelText: labelText.width });
            expect(valueCut || labelCut).toBe(true);
        }
    });

    test("2 a very long value in an Auto-fit column squeezes the next column to its minimum", async ({ page }) => {
        const autoFit = new Combobox(page.locator(".mx-name-comboAutoFitLong"));
        const neighbour = new Combobox(page.locator(".mx-name-comboAutoFitLongNeighbour"));
        const [a, b] = [await rect(column(autoFit)), await rect(column(neighbour))];

        log("2", { autoFitWidth: a.width, neighbourWidth: b.width, wrapped: b.top > a.bottom - 1 });
        expect(b.width).toBeLessThan(200);
    });

    test("3 an Auto-fit column gets wider as soon as the user types", async ({ page }) => {
        const autoFit = new Combobox(page.locator(".mx-name-autoFitRow .mx-name-comboAutoFit"));
        const before = (await rect(column(autoFit))).width;
        await autoFit.open();
        await autoFit.input.pressSequentially("M");
        const after = (await rect(column(autoFit))).width;

        log("3", { before, after });
        expect(after).toBeGreaterThan(before + 5);
    });

    test("4 in a 100px parent the field sticks out of it", async ({ page }) => {
        const narrow = new Combobox(page.locator(".mx-name-comboNarrow"));
        const parent = await rect(page.locator(".mx-name-predictNarrow"));
        const box = await rect(field(narrow));

        log("4", { parentWidth: parent.width, fieldWidth: box.width, overflow: box.right - parent.right });
        expect(box.right).toBeGreaterThan(parent.right + 1);
    });

    test("4 at 320px wide, a row of three Auto-fill comboboxes is wider than the screen", async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 720 });
        const columns = page.locator(".mx-name-autoFillRow .row > div");
        await expect(columns).toHaveCount(3);
        const boxes = await columns.evaluateAll(cols =>
            cols.map(c => {
                const r = c.getBoundingClientRect();
                return { top: r.top, right: r.right, width: r.width };
            })
        );

        log("4 phone", {
            columns: boxes.map(b => `${Math.round(b.width)}px@top${Math.round(b.top)}`).join(" "),
            rowRight: Math.max(...boxes.map(b => b.right))
        });
        expect(Math.max(...boxes.map(b => b.right))).toBeGreaterThan(320);
    });

    test("5 clearing the value resizes an Auto-fit column", async ({ page }) => {
        const autoFit = new Combobox(page.locator(".mx-name-autoFitRow .mx-name-comboAutoFit"));
        const before = (await rect(column(autoFit))).width;
        await autoFit.clear();
        await page.locator(".mx-name-pageTitle").click();
        const after = (await rect(column(autoFit))).width;

        log("5", { before, after });
        expect(Math.abs(after - before)).toBeGreaterThan(2);
    });

    test("6 custom content that does not wrap widens its Auto-fill column", async ({ page }) => {
        const custom = new Combobox(page.locator(".mx-name-comboCustomLong"));
        const other = new Combobox(page.locator(".mx-name-comboCustomShort"));
        await expect(custom.root.locator(".mx-name-customCaption")).toBeVisible();
        const [a, b] = [await rect(column(custom)), await rect(column(other))];

        log("6", { customColumn: a.width, otherColumn: b.width });
        expect(a.width).toBeGreaterThan(b.width + 20);
    });
});
