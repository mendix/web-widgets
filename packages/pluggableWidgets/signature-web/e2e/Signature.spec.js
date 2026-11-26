import { test, expect } from "@mendix/run-e2e/fixtures";

const canvas = (page, name) => page.locator(`.mx-name-${name} canvas`);
const state = (page, name) => page.locator(`.mx-name-textState${name}`);

async function drawStroke(page, target) {
    const box = await target.boundingBox();
    await page.mouse.move(box.x + 60, box.y + 120);
    await page.mouse.down();
    await page.mouse.move(box.x + 160, box.y + 60, { steps: 10 });
    await page.mouse.move(box.x + 260, box.y + 140, { steps: 10 });
    await page.mouse.up();
}

// The canvas is the widget's output: count the painted pixels and read the color of one of them.
const paint = target =>
    target.evaluate(c => {
        const data = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
        let pixels = 0;
        let color;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 255) {
                pixels++;
                color ??= `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`;
            }
        }
        return { pixels, color };
    });

test.describe("signature-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("renders the canvas with its label and background grid", async ({ page }) => {
        await expect(canvas(page, "signatureEditable")).toHaveAttribute("aria-label", "Sign here");
        await expect(page.locator(".mx-name-signatureEditable .widget-signature-grid")).toBeVisible();
    });

    test("saves the signature and runs the sign end action", async ({ page }) => {
        await expect(state(page, "Editable")).toHaveText("Has signature: No, signed 0 times, ");

        await drawStroke(page, canvas(page, "signatureEditable"));

        await expect(state(page, "Editable")).toHaveText("Has signature: Yes, signed 1 times, data:image/png;base64,");
    });

    test("draws with the pen color", async ({ page }) => {
        const target = canvas(page, "signatureEditable");

        await drawStroke(page, target);

        await expect.poll(async () => (await paint(target)).color).toBe("rgb(255, 0, 0)");
    });

    test("clears the canvas when the has signature attribute becomes false", async ({ page }) => {
        const target = canvas(page, "signatureEditable");
        await drawStroke(page, target);
        // Wait for the sign end action, so its response can't arrive after the clear and undo it.
        await expect(state(page, "Editable")).toContainText("Has signature: Yes, signed 1 times");
        await expect.poll(async () => (await paint(target)).pixels).toBeGreaterThan(0);

        await page.locator(".mx-name-actionButtonClear").click();

        await expect(state(page, "Editable")).toContainText("Has signature: No");
        await expect.poll(async () => (await paint(target)).pixels).toBe(0);
    });

    test("ignores drawing when it is read-only", async ({ page }) => {
        const readOnly = canvas(page, "signatureReadOnly");
        await expect(page.locator(".mx-name-signatureReadOnly .widget-signature-grid")).toHaveCount(0);

        await drawStroke(page, readOnly);
        // The editable signature on the same page saves its stroke; by then a read-only one would have too.
        await drawStroke(page, canvas(page, "signatureEditable"));
        await expect(state(page, "Editable")).toContainText("signed 1 times");

        await expect(state(page, "ReadOnly")).toHaveText("Has signature: No, signed 0 times");
        expect((await paint(readOnly)).pixels).toBe(0);
    });
});
