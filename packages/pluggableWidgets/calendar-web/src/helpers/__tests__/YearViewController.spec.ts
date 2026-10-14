import { YearViewController } from "../YearViewController";

describe("YearViewController", () => {
    describe("navigate", () => {
        it("subtracts 1 year on PREV", () => {
            const result = YearViewController.navigate(new Date(2026, 5, 15), "PREV");
            expect(result.getFullYear()).toBe(2025);
            expect(result.getMonth()).toBe(5);
            expect(result.getDate()).toBe(15);
        });

        it("adds 1 year on NEXT", () => {
            const result = YearViewController.navigate(new Date(2026, 5, 15), "NEXT");
            expect(result.getFullYear()).toBe(2027);
        });

        it("returns the same date for TODAY (and any other action)", () => {
            const date = new Date(2026, 5, 15);
            expect(YearViewController.navigate(date, "TODAY")).toBe(date);
            expect(YearViewController.navigate(date, "DATE")).toBe(date);
        });
    });

    describe("title", () => {
        it("returns the four-digit year as a string", () => {
            expect(YearViewController.title(new Date(2026, 0, 1))).toBe("2026");
            expect(YearViewController.title(new Date(2026, 11, 31))).toBe("2026");
        });
    });

    describe("range", () => {
        it("returns [Jan 1, Dec 31] for the given year", () => {
            const [start, end] = YearViewController.range(new Date(2026, 5, 15));
            expect(start.getFullYear()).toBe(2026);
            expect(start.getMonth()).toBe(0);
            expect(start.getDate()).toBe(1);
            expect(end.getFullYear()).toBe(2026);
            expect(end.getMonth()).toBe(11);
            expect(end.getDate()).toBe(31);
        });
    });

    describe("getComponent", () => {
        it("returns a component with navigate/title/range statics attached", () => {
            const Component = YearViewController.getComponent();
            expect(Component.navigate).toBe(YearViewController.navigate);
            expect(Component.title).toBe(YearViewController.title);
            expect(Component.range).toBe(YearViewController.range);
        });
    });
});
