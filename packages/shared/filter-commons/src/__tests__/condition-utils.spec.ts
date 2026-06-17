jest.mock("mendix/filters/builders");

import { AndCondition, FilterCondition } from "mendix/filters";
import { and, attribute, equals, literal, notEqual, or } from "mendix/filters/builders";
import {
    isEmptyExp,
    isEmptyStringExp,
    isNotEmptyExp,
    isNotEmptyStringExp,
    reduceArray,
    reduceMap,
    restoreArray,
    restoreMap,
    tag
} from "../condition-utils";

describe("condition-utils", () => {
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

    describe("reduceArray", () => {
        it("returns undefined condition and correct metadata for array with undefined values", () => {
            const input = [undefined, undefined, undefined];
            const [condition, metadata] = reduceArray(input);

            expect(condition).toBeUndefined();

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual([3, []]);
        });

        it("returns single condition and correct metadata for array with one condition", () => {
            const tagCondition = tag("test");
            const input = [undefined, tagCondition, undefined];
            const [condition, metadata] = reduceArray(input);

            expect(condition).toBe(tagCondition);

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual([3, [1]]);
        });

        it("returns 'and' condition and correct metadata for array with multiple conditions", () => {
            const tagCondition1 = tag("test1");
            const tagCondition2 = tag("test2");
            const input = [tagCondition1, undefined, tagCondition2, undefined];
            const [condition, metadata] = reduceArray(input);

            expect(condition).toMatchObject({ name: "and", type: "function" });
            expect((condition as AndCondition).args).toHaveLength(2);
            expect((condition as AndCondition).args[0]).toBe(tagCondition1);
            expect((condition as AndCondition).args[1]).toBe(tagCondition2);

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual([4, [0, 2]]);
        });

        it("returns undefined condition for empty array", () => {
            const input: Array<FilterCondition | undefined> = [];
            const [condition, metadata] = reduceArray(input);

            expect(condition).toBeUndefined();

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual([0, []]);
        });

        it("handles array with mixed condition types", () => {
            const tagCondition = tag("tag-test");
            const equalsCondition = equals(literal("field"), literal("value"));
            const input = [tagCondition, undefined, equalsCondition, undefined, undefined];
            const [condition, metadata] = reduceArray(input);

            expect(condition).toMatchObject({ name: "and", type: "function" });
            expect((condition as AndCondition).args).toHaveLength(2);
            expect((condition as AndCondition).args[0]).toBe(tagCondition);
            expect((condition as AndCondition).args[1]).toBe(equalsCondition);

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual([5, [0, 2]]);
        });

        it("handles array with single condition at beginning", () => {
            const tagCondition = tag("first");
            const input = [tagCondition, undefined, undefined];
            const [condition, metadata] = reduceArray(input);

            expect(condition).toBe(tagCondition);

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual([3, [0]]);
        });

        it("handles array with single condition at end", () => {
            const tagCondition = tag("last");
            const input = [undefined, undefined, tagCondition];
            const [condition, metadata] = reduceArray(input);

            expect(condition).toBe(tagCondition);

            const parsedMeta = JSON.parse(metadata);
            expect(parsedMeta).toEqual([3, [2]]);
        });
    });

    describe("restoreArray", () => {
        it("restores array with undefined values from undefined condition", () => {
            const originalInput = [undefined, undefined, undefined];
            const [condition, metadata] = reduceArray(originalInput);

            const restored = restoreArray(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("restores array with single condition", () => {
            const tagCondition = tag("test");
            const originalInput = [undefined, tagCondition, undefined];
            const [condition, metadata] = reduceArray(originalInput);

            const restored = restoreArray(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("restores array with multiple conditions", () => {
            const tagCondition1 = tag("test1");
            const tagCondition2 = tag("test2");
            const originalInput = [tagCondition1, undefined, tagCondition2, undefined];
            const [condition, metadata] = reduceArray(originalInput);

            const restored = restoreArray(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("restores empty array", () => {
            const originalInput: Array<FilterCondition | undefined> = [];
            const [condition, metadata] = reduceArray(originalInput);

            const restored = restoreArray(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("restores array with mixed condition types", () => {
            const tagCondition = tag("tag-test");
            const equalsCondition = equals(literal("field"), literal("value"));
            const originalInput = [tagCondition, undefined, equalsCondition, undefined, undefined];
            const [condition, metadata] = reduceArray(originalInput);

            const restored = restoreArray(condition, metadata);

            expect(restored).toEqual(originalInput);
        });

        it("handles manual metadata for single condition case", () => {
            const tagCondition = tag("manual-test");
            const metadata = JSON.stringify([4, [2]]);

            const restored = restoreArray(tagCondition, metadata);

            expect(restored).toEqual([undefined, undefined, tagCondition, undefined]);
        });

        it("handles manual metadata for multiple conditions case", () => {
            const tagCondition1 = tag("manual1");
            const tagCondition2 = tag("manual2");
            const andCondition = {
                name: "and",
                type: "function",
                args: [tagCondition1, tagCondition2]
            } as AndCondition;
            const metadata = JSON.stringify([5, [1, 3]]);

            const restored = restoreArray(andCondition, metadata);

            expect(restored).toEqual([undefined, tagCondition1, undefined, tagCondition2, undefined]);
        });

        it("handles edge case with undefined condition and non-empty indexes", () => {
            const metadata = JSON.stringify([3, [1]]);

            const restored = restoreArray(undefined, metadata);

            expect(restored).toEqual([undefined, undefined, undefined]);
        });

        it("handles edge case with non-and condition but multiple indexes", () => {
            const tagCondition = tag("single");
            const metadata = JSON.stringify([4, [0, 2]]);

            const restored = restoreArray(tagCondition, metadata);

            expect(restored).toEqual([undefined, undefined, undefined, undefined]);
        });

        it("round-trip test with complex array", () => {
            const tag1 = tag("one");
            const tag2 = tag("two");
            const eq1 = equals(literal("a"), literal("b"));
            const originalInput = [tag1, undefined, eq1, undefined, tag2, undefined, undefined];

            const [condition, metadata] = reduceArray(originalInput);
            const restored = restoreArray(condition, metadata);

            expect(restored).toEqual(originalInput);
        });
    });

    describe("isEmptyStringExp", () => {
        it("identifies correct empty expression", () => {
            const emptyStringExpression = or(
                equals(attribute("testAttrId" as any), literal(undefined)),
                equals(attribute("testAttrId" as any), literal(""))
            );
            expect(isEmptyStringExp(emptyStringExpression)).toBe(true);
        });

        it("returns false for expressions with different attribute ids", () => {
            const mismatchedAttributes = or(
                equals(attribute("testAttrId1" as any), literal(undefined)),
                equals(attribute("testAttrId2" as any), literal(""))
            );
            expect(isEmptyStringExp(mismatchedAttributes)).toBe(false);
        });

        it("returns false for expressions with incorrect arguments order", () => {
            const mismatchedOrder = or(
                equals(attribute("testAttrId" as any), literal("")),
                equals(attribute("testAttrId" as any), literal(undefined))
            );
            expect(isEmptyStringExp(mismatchedOrder)).toBe(false);
        });

        it("returns false for expressions with incorrect number of arguments", () => {
            const mismatchedNumberOffArgs = or(
                equals(attribute("testAttrId" as any), literal("")),
                equals(attribute("testAttrId" as any), literal(undefined)),
                equals(attribute("testAttrId" as any), literal(undefined))
            );
            expect(isEmptyStringExp(mismatchedNumberOffArgs)).toBe(false);
        });

        it("returns false for and-based expression (isNotEmptyStringExp shape)", () => {
            const notEmptyStringExpression = and(
                notEqual(attribute("testAttrId" as any), literal(undefined)),
                notEqual(attribute("testAttrId" as any), literal(""))
            );
            expect(isEmptyStringExp(notEmptyStringExpression)).toBe(false);
        });
    });

    describe("isNotEmptyStringExp", () => {
        it("identifies correct not-empty expression", () => {
            const notEmptyStringExpression = and(
                notEqual(attribute("testAttrId" as any), literal(undefined)),
                notEqual(attribute("testAttrId" as any), literal(""))
            );
            expect(isNotEmptyStringExp(notEmptyStringExpression)).toBe(true);
        });

        it("returns false for expressions with different attribute ids", () => {
            const mismatchedAttributes = and(
                notEqual(attribute("testAttrId1" as any), literal(undefined)),
                notEqual(attribute("testAttrId2" as any), literal(""))
            );
            expect(isNotEmptyStringExp(mismatchedAttributes)).toBe(false);
        });

        it("returns false for expressions with incorrect arguments order", () => {
            const mismatchedOrder = and(
                notEqual(attribute("testAttrId" as any), literal("")),
                notEqual(attribute("testAttrId" as any), literal(undefined))
            );
            expect(isNotEmptyStringExp(mismatchedOrder)).toBe(false);
        });

        it("returns false for expressions with incorrect number of arguments", () => {
            const mismatchedNumberOfArgs = and(
                notEqual(attribute("testAttrId" as any), literal(undefined)),
                notEqual(attribute("testAttrId" as any), literal("")),
                notEqual(attribute("testAttrId" as any), literal(undefined))
            );
            expect(isNotEmptyStringExp(mismatchedNumberOfArgs)).toBe(false);
        });

        it("returns false for or-based expression (isEmptyStringExp shape)", () => {
            const emptyStringExpression = or(
                equals(attribute("testAttrId" as any), literal(undefined)),
                equals(attribute("testAttrId" as any), literal(""))
            );
            expect(isNotEmptyStringExp(emptyStringExpression)).toBe(false);
        });
    });

    describe("isEmptyExp", () => {
        it("returns true for equals expression with undefined literal", () => {
            const emptyExp = equals(attribute("testAttrId" as any), literal(undefined));
            expect(isEmptyExp(emptyExp)).toBe(true);
        });

        it("returns false for equals with non-undefined literal", () => {
            const nonEmpty = equals(attribute("testAttrId" as any), literal("value"));
            expect(isEmptyExp(nonEmpty)).toBe(false);
        });

        it("returns false for notEqual with undefined literal", () => {
            const notEmptyExp = notEqual(attribute("testAttrId" as any), literal(undefined));
            expect(isEmptyExp(notEmptyExp)).toBe(false);
        });

        it("returns false for non-binary expression", () => {
            const orExp = or(
                equals(attribute("testAttrId" as any), literal(undefined)),
                equals(attribute("testAttrId" as any), literal(""))
            );
            expect(isEmptyExp(orExp)).toBe(false);
        });

        it("returns false for isEmptyStringExp expression", () => {
            const emptyStringExpression = or(
                equals(attribute("testAttrId" as any), literal(undefined)),
                equals(attribute("testAttrId" as any), literal(""))
            );
            expect(isEmptyStringExp(emptyStringExpression)).toBe(true);
            expect(isEmptyExp(emptyStringExpression)).toBe(false);
        });
    });

    describe("isNotEmptyExp", () => {
        it("returns true for notEqual expression with undefined literal", () => {
            const notEmptyExp = notEqual(attribute("testAttrId" as any), literal(undefined));
            expect(isNotEmptyExp(notEmptyExp)).toBe(true);
        });

        it("returns false for notEqual with non-undefined literal", () => {
            const withValue = notEqual(attribute("testAttrId" as any), literal("value"));
            expect(isNotEmptyExp(withValue)).toBe(false);
        });

        it("returns false for equals with undefined literal", () => {
            const emptyExp = equals(attribute("testAttrId" as any), literal(undefined));
            expect(isNotEmptyExp(emptyExp)).toBe(false);
        });

        it("returns false for non-binary expression", () => {
            const andExp = and(
                notEqual(attribute("testAttrId" as any), literal(undefined)),
                notEqual(attribute("testAttrId" as any), literal(""))
            );
            expect(isNotEmptyExp(andExp)).toBe(false);
        });

        it("returns false for isNotEmptyStringExp expression", () => {
            const notEmptyStringExpression = and(
                notEqual(attribute("testAttrId" as any), literal(undefined)),
                notEqual(attribute("testAttrId" as any), literal(""))
            );
            expect(isNotEmptyStringExp(notEmptyStringExpression)).toBe(true);
            expect(isNotEmptyExp(notEmptyStringExpression)).toBe(false);
        });
    });
});
