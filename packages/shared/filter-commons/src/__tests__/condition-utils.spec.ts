jest.mock("mendix/filters/builders");

import { AndCondition } from "mendix/filters";
import { equals, literal } from "mendix/filters/builders";
import { compactArray, fromCompactArray, reduceMap, restoreMap, tag } from "../condition-utils";

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

    describe("restoreMap", () => {
        it("restores map with undefined values from undefined condition", () => {
            const originalInput = { x: undefined, y: undefined };
            const [condition, metadata] = reduceMap(originalInput);

            const restored = restoreMap(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("restores map with single condition", () => {
            const tagCondition = tag("test");
            const originalInput = { a: tagCondition, b: undefined, c: undefined };
            const [condition, metadata] = reduceMap(originalInput);

            const restored = restoreMap(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("restores map with multiple conditions", () => {
            const tagCondition1 = tag("test1");
            const tagCondition2 = tag("test2");
            const originalInput = { x: tagCondition1, y: undefined, z: tagCondition2, w: undefined };
            const [condition, metadata] = reduceMap(originalInput);

            const restored = restoreMap(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("restores empty map", () => {
            const originalInput = {};
            const [condition, metadata] = reduceMap(originalInput);

            const restored = restoreMap(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("restores map with mixed condition types", () => {
            const tagCondition = tag("tag-test");
            const equalsCondition = equals(literal("field"), literal("value"));
            const originalInput = {
                tag: tagCondition,
                equals: equalsCondition,
                empty: undefined,
                another: undefined
            };
            const [condition, metadata] = reduceMap(originalInput);

            const restored = restoreMap(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("handles manual metadata for single condition case", () => {
            const tagCondition = tag("manual-test");
            const metadata = JSON.stringify({
                length: 1,
                keys: ["first", "second", "third"],
                0: "second"
            });

            const restored = restoreMap(tagCondition, metadata);

            expect(restored).toEqual({
                first: undefined,
                second: tagCondition,
                third: undefined
            });
        });

        it("handles manual metadata for multiple conditions case", () => {
            const tagCondition1 = tag("manual1");
            const tagCondition2 = tag("manual2");
            const andCondition = {
                name: "and",
                type: "function",
                args: [tagCondition1, tagCondition2]
            } as AndCondition;
            const metadata = JSON.stringify({
                length: 2,
                keys: ["a", "b", "c", "d"],
                0: "a",
                1: "c"
            });

            const restored = restoreMap(andCondition, metadata);

            expect(restored).toEqual({
                a: tagCondition1,
                b: undefined,
                c: tagCondition2,
                d: undefined
            });
        });

        it("handles edge case with undefined condition and non-zero length metadata", () => {
            const metadata = JSON.stringify({
                length: 1,
                keys: ["test"],
                0: "test"
            });

            const restored = restoreMap(undefined, metadata);

            expect(restored).toEqual({
                test: undefined
            });
        });

        it("handles edge case with non-and condition but multiple length metadata", () => {
            const tagCondition = tag("single");
            const metadata = JSON.stringify({
                length: 2,
                keys: ["a", "b"],
                0: "a",
                1: "b"
            });

            const restored = restoreMap(tagCondition, metadata);

            expect(restored).toEqual({
                a: undefined,
                b: undefined
            });
        });
    });
});
