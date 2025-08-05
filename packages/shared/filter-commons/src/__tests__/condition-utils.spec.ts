jest.mock("mendix/filters/builders");

import { AndCondition } from "mendix/filters";
import { equals, literal } from "mendix/filters/builders";
import { compactArray, fromCompactArray, reduceMap, tag } from "../condition-utils";

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

    describe("reduceMap", () => {
        it("returns undefined condition and correct metadata for map with undefined values", () => {
            const input = { x: undefined, y: undefined };
            const [condition, metadata] = reduceMap(input);

            expect(condition).toBeUndefined();

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual({
                length: 0,
                keys: ["x", "y"]
            });
        });

        it("returns single condition and correct metadata for map with one condition", () => {
            const tagCondition = tag("test");
            const input = { a: tagCondition, b: undefined, c: undefined };
            const [condition, metadata] = reduceMap(input);

            expect(condition).toBe(tagCondition);

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual({
                length: 1,
                keys: ["a", "b", "c"],
                0: "a"
            });
        });

        it("returns 'and' condition and correct metadata for map with multiple conditions", () => {
            const tagCondition1 = tag("test1");
            const tagCondition2 = tag("test2");
            const input = { x: tagCondition1, y: undefined, z: tagCondition2, w: undefined };
            const [condition, metadata] = reduceMap(input);

            expect(condition).toMatchObject({ name: "and", type: "function" });
            expect((condition as AndCondition).args).toHaveLength(2);
            expect((condition as AndCondition).args[0]).toBe(tagCondition1);
            expect((condition as AndCondition).args[1]).toBe(tagCondition2);

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual({
                length: 2,
                keys: ["x", "y", "z", "w"],
                0: "x",
                1: "z"
            });
        });

        it("returns undefined condition for empty map", () => {
            const input = {};
            const [condition, metadata] = reduceMap(input);

            expect(condition).toBeUndefined();

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual({
                length: 0,
                keys: []
            });
        });

        it("handles map with mixed condition types", () => {
            const tagCondition = tag("tag-test");
            const equalsCondition = equals(literal("field"), literal("value"));
            const input = {
                tag: tagCondition,
                equals: equalsCondition,
                empty: undefined,
                another: undefined
            };
            const [condition, metadata] = reduceMap(input);

            expect(condition).toMatchObject({ name: "and", type: "function" });
            expect((condition as AndCondition).args).toHaveLength(2);
            expect((condition as AndCondition).args[0]).toBe(tagCondition);
            expect((condition as AndCondition).args[1]).toBe(equalsCondition);

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual({
                length: 2,
                keys: ["tag", "equals", "empty", "another"],
                0: "tag",
                1: "equals"
            });
        });
    });
});
