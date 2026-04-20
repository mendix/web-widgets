import Big from "big.js";
import { listAttribute, listExpression, dynamic, obj } from "@mendix/widget-plugin-test-utils";
import { ObjectItem } from "mendix";
import { column } from "../../../utils/test-utils";
import { readChunk, ExcelCell } from "../cell-readers";

function readSingleCell(col: ReturnType<typeof column>, item?: ObjectItem): ExcelCell {
    const items = [item ?? obj()];
    const result = readChunk(items, [col]);
    return result[0][0];
}

describe("cell-readers", () => {
    describe("attribute reader", () => {
        it("exports string attribute as string cell (displayValue)", () => {
            const col = column("Name", c => {
                c.showContentAs = "attribute";
                c.attribute = listAttribute(() => "hello");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            // attribute reader returns displayValue for strings, not raw value
            expect(cell.v).toBe("Formatted hello");
        });

        it("exports number attribute as number cell", () => {
            const col = column("Amount", c => {
                c.showContentAs = "attribute";
                c.attribute = listAttribute(() => new Big("42.5"));
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("n");
            expect(cell.v).toBe(42.5);
        });

        it("exports number attribute with format", () => {
            const col = column("Amount", c => {
                c.showContentAs = "attribute";
                c.attribute = listAttribute(() => new Big("1234.56"));
                c.exportType = "number";
                c.exportNumberFormat = dynamic("#,##0.00");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("n");
            expect(cell.v).toBe(1234.56);
            expect(cell.z).toBe("#,##0.00");
        });

        it("exports boolean attribute as boolean cell", () => {
            const col = column("Active", c => {
                c.showContentAs = "attribute";
                c.attribute = listAttribute(() => true);
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("b");
            expect(cell.v).toBe(true);
        });

        it("exports date attribute with format as date cell", () => {
            const testDate = new Date("2024-06-15T10:30:00Z");
            const col = column("Created", c => {
                c.showContentAs = "attribute";
                c.attribute = listAttribute(() => testDate);
                c.exportType = "date";
                c.exportDateFormat = dynamic("yyyy-mm-dd");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("d");
            expect(cell.v).toEqual(new Date(Date.UTC(2024, 5, 15)));
            expect(cell.z).toBe("yyyy-mm-dd");
        });

        it("exports date attribute without format as string cell (displayValue)", () => {
            const col = column("Created", c => {
                c.showContentAs = "attribute";
                c.attribute = listAttribute(() => new Date("2024-06-15T10:30:00Z"));
                c.exportType = "default";
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
        });

        it("returns empty cell when attribute is not available", () => {
            const col = column("Missing", c => {
                c.showContentAs = "attribute";
                c.attribute = undefined;
            });
            const cell = readSingleCell(col);
            expect(cell).toEqual({ t: "s", v: "" });
        });
    });

    describe("dynamicText reader", () => {
        it("exports dynamic text as string cell", () => {
            const col = column("Label", c => {
                c.showContentAs = "dynamicText";
                c.dynamicText = listExpression(() => "formatted text");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            expect(cell.v).toBe("formatted text");
        });

        it("exports n/a when unavailable", () => {
            const col = column("Label", c => {
                c.showContentAs = "dynamicText";
                c.dynamicText = undefined;
            });
            const cell = readSingleCell(col);
            expect(cell).toEqual({ t: "s", v: "" });
        });
    });

    describe("customContent reader", () => {
        it("exports custom content as string cell (current baseline)", () => {
            const col = column("Custom", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "42.50");
                c.exportType = "default";
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            expect(cell.v).toBe("42.50");
        });

        it("exports empty string when exportValue is undefined", () => {
            const col = column("Custom", c => {
                c.showContentAs = "customContent";
                c.exportValue = undefined;
                c.exportType = "default";
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            expect(cell.v).toBe("");
        });

        it("exports as number cell when exportType is number", () => {
            const col = column("Price", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "1234.56");
                c.exportType = "number";
                c.exportNumberFormat = dynamic("#,##0.00");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("n");
            expect(cell.v).toBe(1234.56);
            expect(cell.z).toBe("#,##0.00");
        });

        it("exports as number cell without format", () => {
            const col = column("Count", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "99");
                c.exportType = "number";
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("n");
            expect(cell.v).toBe(99);
        });

        it("falls back to string when number parse fails", () => {
            const col = column("Bad", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "not-a-number");
                c.exportType = "number";
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            expect(cell.v).toBe("not-a-number");
        });

        it("falls back to string for empty value with number exportType", () => {
            const col = column("Empty", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "");
                c.exportType = "number";
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            expect(cell.v).toBe("");
        });

        it("exports as date cell when exportType is date", () => {
            const col = column("Created", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "2024-06-15T00:00:00.000Z");
                c.exportType = "date";
                c.exportDateFormat = dynamic("yyyy-mm-dd");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("d");
            expect(cell.v).toEqual(new Date("2024-06-15T00:00:00.000Z"));
            expect(cell.z).toBe("yyyy-mm-dd");
        });

        it("exports date as string when no format provided", () => {
            const col = column("Created", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "2024-06-15T10:30:00Z");
                c.exportType = "date";
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            expect(cell.v).toBe("2024-06-15T10:30:00Z");
        });

        it("falls back to string when date parse fails", () => {
            const col = column("Bad", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "not-a-date");
                c.exportType = "date";
                c.exportDateFormat = dynamic("yyyy-mm-dd");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            expect(cell.v).toBe("not-a-date");
        });

        it("falls back to string for empty value with date exportType", () => {
            const col = column("Empty", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "");
                c.exportType = "date";
                c.exportDateFormat = dynamic("yyyy-mm-dd");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("s");
            expect(cell.v).toBe("");
        });
    });

    describe("date time stripping", () => {
        it("strips time from attribute date when format has no time components", () => {
            const testDate = new Date("2024-06-15T10:30:00Z");
            const col = column("DateOnly", c => {
                c.showContentAs = "attribute";
                c.attribute = listAttribute(() => testDate);
                c.exportType = "date";
                c.exportDateFormat = dynamic("dd-mmm-yyyy");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("d");
            expect(cell.v).toEqual(new Date(Date.UTC(2024, 5, 15)));
            expect(cell.z).toBe("dd-mmm-yyyy");
        });

        it("preserves time in attribute date when format has time components", () => {
            const testDate = new Date("2024-06-15T10:30:00Z");
            const col = column("DateTime", c => {
                c.showContentAs = "attribute";
                c.attribute = listAttribute(() => testDate);
                c.exportType = "date";
                c.exportDateFormat = dynamic("yyyy-mm-dd hh:mm:ss");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("d");
            expect(cell.v).toEqual(testDate);
        });

        it("strips time from customContent date when format has no time components", () => {
            const col = column("DateOnly", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "2024-06-15T10:30:00Z");
                c.exportType = "date";
                c.exportDateFormat = dynamic("dd-mmm-yyyy");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("d");
            expect(cell.v).toEqual(new Date(Date.UTC(2024, 5, 15)));
        });

        it("preserves time in customContent date when format has time components", () => {
            const col = column("DateTime", c => {
                c.showContentAs = "customContent";
                c.exportValue = listExpression(() => "2024-06-15T10:30:00Z");
                c.exportType = "date";
                c.exportDateFormat = dynamic("yyyy-mm-dd hh:mm:ss");
            });
            const cell = readSingleCell(col);
            expect(cell.t).toBe("d");
            expect(cell.v).toEqual(new Date("2024-06-15T10:30:00Z"));
        });
    });
});
