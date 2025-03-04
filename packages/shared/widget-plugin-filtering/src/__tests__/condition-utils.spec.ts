jest.mock("mendix/filters/builders");

import { AndCondition } from "mendix/filters";
import { equals, literal } from "mendix/filters/builders";
import { compactArray, fromCompactArray, tag } from "../condition-utils";

describe("condition-utils", () => {
    describe("compactArray", () => {
        it("returns 'tag' condition for zero array", () => {
            const result = compactArray([]);
            expect(result).toMatchObject({
                name: "!=",
                type: "function",
                arg1: { value: "[0,[]]", valueType: "String" }
            });
        });

        it("returns 'tag' condition for array of undefined", () => {
            const result = compactArray([undefined, undefined, undefined]);
            expect(result).toMatchObject({
                name: "!=",
                type: "function",
                arg1: { value: "[3,[]]", valueType: "String" }
            });
        });

        it("returns 'and' condition with 3 args", () => {
            const result = compactArray([tag("0"), undefined, tag("2")]);
            expect(result).toMatchObject({ name: "and", type: "function" });
            expect((result as AndCondition).args).toHaveLength(3);
        });
    });

    describe("fromCompactArray", () => {
        it("unpack condition created with compactArray", () => {
            const input = [
                equals(literal("1"), literal("1")),
                undefined,
                equals(literal("foo"), literal("bar")),
                undefined,
                undefined,
                equals(literal(new Date("2024-09-17T14:00:00.000Z")), literal(new Date("2024-09-17T14:00:00.000Z")))
            ];
            const cond = compactArray(input);
            expect(cond).toBeDefined();
            const result = fromCompactArray(cond!);
            expect(result).toEqual(input);
        });
    });
});
