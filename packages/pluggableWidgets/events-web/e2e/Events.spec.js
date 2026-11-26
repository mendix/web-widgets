import { test, expect } from "@mendix/run-e2e/fixtures";

// Every action call increments the count and appends the current name to the log of its own object.
const count = (page, section) => page.locator(`.mx-name-textCount${section}`);
const log = (page, section) => page.locator(`.mx-name-textLog${section}`);

const countValue = async (page, section) => Number((await count(page, section).textContent()).replace("Count: ", ""));

async function changeName(page, section, value) {
    const input = page.locator(`.mx-name-textBoxName${section} input`);
    await input.fill(value);
    await input.press("Tab");
}

test.describe("events-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("component load", () => {
        test("runs the action once when the widget loads", async ({ page }) => {
            await expect(count(page, "Load")).toHaveText("Count: 1");

            // The repeating widget on the same page has run three times by now.
            await expect.poll(() => countValue(page, "Repeat"), { timeout: 10_000 }).toBeGreaterThanOrEqual(3);
            await expect(count(page, "Load")).toHaveText("Count: 1");
        });

        for (const [section, description] of [
            ["Delay", "a value"],
            ["DelayExpression", "an expression"]
        ]) {
            test(`waits for the delay from ${description} before running the action`, async ({ page }) => {
                const pageReady = Date.now();
                await expect(count(page, "Load")).toHaveText("Count: 1");
                await expect(count(page, section)).toHaveText("Count: 0");

                await expect(count(page, section)).toHaveText("Count: 1", { timeout: 10_000 });

                // The delay is 4 seconds from the moment the widget loads, which is before the page is ready.
                expect(Date.now() - pageReady).toBeGreaterThan(2_000);
            });
        }

        test("repeats the action at the interval", async ({ page }) => {
            await expect.poll(() => countValue(page, "Repeat"), { timeout: 10_000 }).toBeGreaterThanOrEqual(3);
        });
    });

    test.describe("attribute change", () => {
        test("runs the action when the attribute changes", async ({ page }) => {
            await expect(count(page, "Change")).toHaveText("Count: 0");

            await changeName(page, "Change", "Alice");

            await expect(log(page, "Change")).toHaveText("Log: Alice;");
        });

        test("ignores changes of other attributes", async ({ page }) => {
            await changeName(page, "Change", "Alice");
            await expect(log(page, "Change")).toHaveText("Log: Alice;");

            const otherName = page.locator(".mx-name-textBoxOtherNameChange input");
            await otherName.fill("Bob");
            await otherName.press("Tab");
            await changeName(page, "Change", "Carol");

            await expect(log(page, "Change")).toHaveText("Log: Alice;Carol;");
        });

        test("runs the action once after the delay for quick changes", async ({ page }) => {
            await changeName(page, "ChangeDelay", "Alice");
            // One action round trip in the other section, still well within the 2 second delay.
            await changeName(page, "Change", "Sync");
            await expect(log(page, "Change")).toHaveText("Log: Sync;");
            await changeName(page, "ChangeDelay", "Bob");

            await expect(log(page, "ChangeDelay")).toHaveText("Log: Bob;", { timeout: 10_000 });

            await changeName(page, "ChangeDelay", "Carol");
            await expect(log(page, "ChangeDelay")).toHaveText("Log: Bob;Carol;", { timeout: 10_000 });
        });
    });
});
