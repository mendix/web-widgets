import { expect, test } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp, waitFrames } from "@mendix/run-e2e/mendix-helpers";
import Combobox from "./utils/Combobox.pageObject";
import { parseLogEntries } from "./utils/logEntryParser";

test.describe("combobox-web onChange", () => {
    test.describe("boolean", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/events/onchange/boolean");
            await waitForMendixApp(page);
        });

        test("should trigger onChange event", async ({ page }) => {
            const combobox = new Combobox(getCombobox(page));

            await combobox.selectOption("Yes");

            const entries = await getLogs(page);
            expect(entries[entries.length - 1].booleanAttr).toBe(true);
        });
    });

    test.describe("enum", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/events/onchange/enum");
            await waitForMendixApp(page);
        });

        test("should trigger onChange event", async ({ page }) => {
            const combobox = new Combobox(getCombobox(page));

            await combobox.selectOption("Green");

            const entries = await getLogs(page);
            expect(entries[entries.length - 1].enumColorAttr).toBe("Green");
        });
    });

    test.describe("single assoc", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/events/onchange/singleassoc");
            await waitForMendixApp(page);
        });

        test("should trigger onChange event", async ({ page }) => {
            const combobox = new Combobox(getCombobox(page));

            await combobox.selectOption("Single Option nr.1");

            const entries = await getLogs(page);
            expect(entries[entries.length - 1].singleAssocTitle).toBe("Single Option nr.1");
        });
    });

    test.describe("multi assoc", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/events/onchange/multiassoc");
            await waitForMendixApp(page);
        });

        test("should trigger onChange event", async ({ page }) => {
            const combobox = new Combobox(getCombobox(page));

            await combobox.selectOption("Multi Option nr.1");
            await combobox.selectOption("Multi Option nr.2");

            const entries = await getLogs(page);
            expect(entries[entries.length - 1].multiAssocTitles).toEqual(["Multi Option nr.1", "Multi Option nr.2"]);
        });
    });

    test.describe("database options over string", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/events/onchange/databaseoverstring");
            await waitForMendixApp(page);
        });

        test("should trigger onChange event", async ({ page }) => {
            const combobox = new Combobox(getCombobox(page));

            await combobox.selectOption("Single Option nr.2");

            const entries = await getLogs(page);
            expect(entries[entries.length - 1].stringAsOptionAttr).toBe("Single Option nr.2");
        });
    });

    test.describe("static options over string", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/events/onchange/staticoverstring");
            await waitForMendixApp(page);
        });

        test("should trigger onChange event", async ({ page }) => {
            const combobox = new Combobox(getCombobox(page));

            await combobox.selectOption("Option 3");

            const entries = await getLogs(page);
            expect(entries[entries.length - 1].stringAsOptionAttr).toBe("option3");
        });
    });

    test.describe("read association to pass to onChange", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/events/onchange/passassoc");
            await waitForMendixApp(page);
        });

        test("should trigger onChange event with updated value", async ({ page }) => {
            const combobox = new Combobox(getCombobox(page));

            await combobox.selectOption("Single Option nr.2");

            const entries = await getLogs(page);
            expect(entries[entries.length - 1].passedAssociationTitle).toBe("Single Option nr.2");
        });
    });
});

function getCombobox(page) {
    return page.locator(".mx-name-comboBox3");
}

async function getLogs(page) {
    await waitFrames(page, 10);
    const text = await page.locator(".mx-name-text2").innerText();

    return parseLogEntries(text);
}
