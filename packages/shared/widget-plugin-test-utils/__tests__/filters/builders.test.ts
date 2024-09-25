jest.mock("mendix/filters/builders");
import { Big } from "big.js";
import {
    literal,
    attribute,
    equals,
    or,
    and,
    dayLessThanOrEqual,
    dayLessThan,
    dayGreaterThanOrEqual
} from "mendix/filters/builders";
import * as builders from "mendix/filters/builders";
import { attrId, obj } from "../../src/main";

describe("mendix/filters/builders mock", () => {
    test.each([
        [true, "boolean"],
        [false, "boolean"],
        ["!", "String"],
        ["", "String"],
        [new Big(0), "Numeric"],
        [new Big(0.49), "Numeric"],
        [new Big(-1), "Numeric"],
        [new Date("2024-09-20"), "DateTime"],
        [obj("12345"), "Reference"],
        [[obj("12345")], "ReferenceSet"],
        [undefined, "undefined"]
    ])("literal(%j) returns object with value type '%s'", (value, expectedType) => {
        const output = literal(value);
        expect(output.type).toBe("literal");
        expect(output.value).toBe(value);
        expect(output.valueType).toBe(expectedType);
    });

    test("attribute", () => {
        expect(attribute(attrId("csj_5"))).toEqual({
            type: "attribute",
            attributeId: "attr_csj_5"
        });
    });

    test.each([
        ["equals", "="],
        ["notEqual", "!="],
        ["dayEquals", "day:="],
        ["dayNotEqual", "day:!="],
        ["dayGreaterThan", "day:>"],
        ["dayGreaterThanOrEqual", "day:>="],
        ["dayLessThan", "day:<"],
        ["dayLessThanOrEqual", "day:<="]
    ])("%s returns correct shape", (fn, name) => {
        expect(
            (builders[fn as keyof typeof builders] as any)(attribute(attrId("foo_bar")), literal(undefined))
        ).toEqual({
            type: "function",
            name,
            arg1: {
                type: "attribute",
                attributeId: "attr_foo_bar"
            },
            arg2: {
                type: "literal",
                value: undefined,
                valueType: "undefined"
            }
        });
    });

    test("or", () => {
        expect(
            or(
                equals(literal(true), literal(true)),
                equals(literal("!"), literal("!")),
                equals(literal("X"), literal(false))
            )
        ).toEqual({
            type: "function",
            name: "or",
            args: [
                equals(literal(true), literal(true)),
                equals(literal("!"), literal("!")),
                equals(literal("X"), literal(false))
            ]
        });
    });

    test("and", () => {
        expect(
            and(
                equals(literal(true), literal(true)),
                equals(literal("!"), literal("!")),
                equals(literal("X"), literal(false))
            )
        ).toEqual({
            type: "function",
            name: "and",
            args: [
                equals(literal(true), literal(true)),
                equals(literal("!"), literal("!")),
                equals(literal("X"), literal(false))
            ]
        });
    });

    describe("nested condition", () => {
        test("case 1", () => {
            expect(
                or(
                    dayLessThanOrEqual(attribute(attrId("jei_5")), literal(new Date("1961-04-12T23:00:00.000Z"))),
                    dayLessThanOrEqual(attribute(attrId("jei_6")), literal(new Date("1961-04-12T23:00:00.000Z")))
                )
            ).toMatchSnapshot();
        });

        test("case 2", () => {
            expect(
                and(
                    dayGreaterThanOrEqual(attribute(attrId("jei_5")), literal(new Date("1961-04-12T23:00:00.000Z"))),
                    dayLessThan(attribute(attrId("jei_5")), literal(new Date("1961-04-12T23:00:00.000Z")))
                )
            ).toMatchSnapshot();
        });
    });
});
