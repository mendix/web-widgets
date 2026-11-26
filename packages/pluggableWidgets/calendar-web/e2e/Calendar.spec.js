import { test, expect } from "@mendix/run-e2e/fixtures";

// The seeded events and the initial date (10 March 2025) are in UTC.
test.use({ timezoneId: "UTC", locale: "en-US" });

class Calendar {
    constructor(page, name) {
        this.root = page.locator(`.mx-name-${name}`);
    }

    get label() {
        return this.root.locator(".calendar-label");
    }

    event(title) {
        return this.root.locator(".rbc-event").filter({ hasText: title });
    }

    toolbarButton(name) {
        return this.root.locator(".calendar-toolbar").getByRole("button", { name, exact: true });
    }

    get previousButton() {
        return this.root
            .locator(".calendar-toolbar button")
            .filter({ has: this.root.page().locator(".mx-icon-controls-backward") });
    }

    get nextButton() {
        return this.root
            .locator(".calendar-toolbar button")
            .filter({ has: this.root.page().locator(".mx-icon-controls-forward") });
    }

    // Month view of March 2025 starts on Sunday 23 February.
    monthDayCell(dayOfMarch) {
        return this.root.locator(".rbc-month-view .rbc-day-bg").nth(5 + dayOfMarch);
    }

    // The event rows cover the day cells and time slots; the calendar selects the slot under the pointer.
    async selectSlot(slot) {
        await slot.click({ force: true });
    }
}

test.describe("calendar-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("standard view", () => {
        test("opens the month of the start date with its events", async ({ page }) => {
            const calendar = new Calendar(page, "calendarStandard");

            await expect(calendar.label).toHaveText("March 2025");
            await expect(calendar.root.locator(".rbc-month-view")).toBeVisible();
            await expect(calendar.event("Team meeting")).toBeVisible();
            await expect(calendar.event("Lunch")).toBeVisible();
            await expect(calendar.event("Conference")).toBeVisible();
        });

        test("colors an event with its color attribute", async ({ page }) => {
            const calendar = new Calendar(page, "calendarStandard");

            await expect(calendar.event("Team meeting")).toHaveCSS("background-color", "rgb(255, 0, 0)");
        });

        test("navigates between months", async ({ page }) => {
            const calendar = new Calendar(page, "calendarStandard");
            await expect(calendar.label).toHaveText("March 2025");

            await calendar.nextButton.click();
            await expect(calendar.label).toHaveText("April 2025");
            await expect(calendar.event("Team meeting")).toHaveCount(0);

            await calendar.previousButton.click();
            await calendar.previousButton.click();
            await expect(calendar.label).toHaveText("February 2025");
        });

        test("runs the view range change action with the new range and view", async ({ page }) => {
            const calendar = new Calendar(page, "calendarStandard");

            await calendar.nextButton.click();

            // The April 2025 month view starts on Sunday 30 March.
            await expect(page.locator(".mx-name-textRange")).toHaveText("Range: 2025-03-30 month");
        });

        test("switches to the week and day views", async ({ page }) => {
            const calendar = new Calendar(page, "calendarStandard");

            await calendar.toolbarButton("Week").click();
            await expect(calendar.root.locator(".rbc-time-view")).toBeVisible();
            await expect(calendar.root.locator(".rbc-time-content .rbc-day-slot")).toHaveCount(7);
            await expect(calendar.event("Team meeting")).toBeVisible();
            await expect(
                calendar.root.locator(".rbc-allday-cell .rbc-event").filter({ hasText: "Conference" })
            ).toBeVisible();

            await calendar.toolbarButton("Day").click();
            await expect(calendar.root.locator(".rbc-time-content .rbc-day-slot")).toHaveCount(1);
            await expect(calendar.event("Team meeting")).toBeVisible();
            await expect(calendar.event("Lunch")).toHaveCount(0);
        });

        test("runs the edit action for a double clicked event", async ({ page }) => {
            const calendar = new Calendar(page, "calendarStandard");

            await calendar.event("Team meeting").dblclick();

            await expect(page.locator(".mx-name-textEditedEvent")).toHaveText("Edit Team meeting");
        });

        test("runs the create action for a selected slot", async ({ page }) => {
            const calendar = new Calendar(page, "calendarStandard");
            await expect(calendar.event("Team meeting")).toBeVisible();
            const created = calendar.event("New event 2025-03-20");
            const before = await created.count();

            await calendar.selectSlot(calendar.monthDayCell(20));

            await expect(created).toHaveCount(before + 1);
        });
    });

    test.describe("custom view", () => {
        test("opens the configured view with the custom top bar", async ({ page }) => {
            const calendar = new Calendar(page, "calendarCustom");

            await expect(calendar.toolbarButton("Work week")).toBeVisible();
            await expect(calendar.toolbarButton("Agenda")).toBeVisible();
            await expect(calendar.root.locator(".rbc-time-content .rbc-day-slot")).toHaveCount(5);
            await expect(calendar.event("Team meeting")).toBeVisible();
        });

        test("switches to the agenda view", async ({ page }) => {
            const calendar = new Calendar(page, "calendarCustom");

            await calendar.toolbarButton("Agenda").click();

            const agenda = calendar.root.locator(".rbc-agenda-view");
            await expect(agenda).toBeVisible();
            await expect(agenda).toContainText("Team meeting");
            await expect(agenda).toContainText("Lunch");
        });

        test("does not create events when it is not editable", async ({ page }) => {
            const readOnly = new Calendar(page, "calendarCustom");
            const editable = new Calendar(page, "calendarStandard");
            await readOnly.toolbarButton("Month").click();
            await expect(readOnly.event("Team meeting")).toBeVisible();
            const createdByReadOnly = page.locator(".rbc-event").filter({ hasText: "New event 2025-03-19" });
            const createdByEditable = editable.event("New event 2025-03-21");
            const before = await createdByEditable.count();

            await readOnly.selectSlot(readOnly.monthDayCell(19));
            // Both calendars show the same data: once the editable calendar's new event shows,
            // an event created by the read-only calendar would show as well.
            await editable.selectSlot(editable.monthDayCell(21));
            await expect(createdByEditable).toHaveCount(before + 1);

            await expect(createdByReadOnly).toHaveCount(0);
        });
    });
});
