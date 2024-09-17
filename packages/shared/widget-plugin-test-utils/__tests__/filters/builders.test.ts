jest.mock("mendix/filters/builders");
import { ListAttributeValue } from "mendix";
import { literal, attribute, equals, or, and } from "mendix/filters/builders";
import { obj } from "../../src/functions";

const val = (v: unknown): string => `${v}`;

describe("mendix/filters/builders mock", () => {
    test("literal", () => {
        expect(val(literal(true))).toBe("literal(true)");
        expect(val(literal("!"))).toBe(val(literal("!")));
        const o = obj("11111");
        expect(val(literal(o))).toBe('literal("obj_11111")');
    });

    test("attribute", () => {
        const id = `attr_xxx` as ListAttributeValue["id"];
        expect(val(attribute(id))).toBe(`attribute("attr_xxx")`);
    });

    test("equals", () => {
        const id = `attr_99999` as ListAttributeValue["id"];
        expect(val(equals(attribute(id), literal(undefined)))).toBe(
            `equals(attribute("attr_99999"),literal(undefined))`
        );
    });

    test("or", () => {
        expect(
            val(
                or(
                    equals(literal(true), literal(true)),
                    equals(literal("!"), literal("!")),
                    equals(literal("X"), literal(false))
                )
            )
        ).toBe(
            `or(equals(literal(true),literal(true)),equals(literal("!"),literal("!")),equals(literal("X"),literal(false)))`
        );
    });

    test("and", () => {
        expect(
            val(
                and(
                    equals(literal(true), literal(true)),
                    equals(literal("!"), literal("!")),
                    equals(literal("X"), literal(false))
                )
            )
        ).toBe(
            `and(equals(literal(true),literal(true)),equals(literal("!"),literal("!")),equals(literal("X"),literal(false)))`
        );
    });
});
