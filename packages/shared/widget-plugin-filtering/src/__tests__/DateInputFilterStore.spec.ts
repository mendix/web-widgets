jest.mock("mendix/filters/builders");
import { configure } from "mobx";
import {
    literal,
    attribute,
    equals,
    notEqual,
    dayEquals,
    dayNotEqual,
    dayGreaterThan,
    dayGreaterThanOrEqual,
    dayLessThan,
    dayLessThanOrEqual,
    or,
    and
} from "mendix/filters/builders";
import { ListAttributeValue } from "mendix";
import { listAttr, attrId } from "@mendix/widget-plugin-test-utils";
import { DateInputFilterStore } from "../stores/DateInputFilterStore";

const val = (v: unknown): string => `${v}`;

configure({
    enforceActions: "never"
});

describe("DateInputFilterStore", () => {
    describe("get condition()", () => {
        let attr: ListAttributeValue<Date>;
        let store: DateInputFilterStore;

        beforeEach(() => {
            attr = listAttr(() => new Date());
            attr.id = attrId("attr_unset");
            store = new DateInputFilterStore([attr], null);
        });

        it("return undefined by default", () => {
            expect(store.condition).toBe(undefined);
        });

        it("returns '= empty' exp when fn is 'empty'", () => {
            store.filterFunction = "empty";
            attr.id = attrId("attr_002");
            expect(val(store.condition)).toBe(val(equals(attribute(attr.id), literal(undefined))));
        });

        it("returns '!= empty' exp when fn is 'notEmpty'", () => {
            store.filterFunction = "notEmpty";
            attr.id = attrId("attr_003");
            expect(val(store.condition)).toBe(val(notEqual(attribute(attr.id), literal(undefined))));
        });

        it("returns 'day:= [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "equal";
            store.arg1.value = date1;
            attr.id = attrId("attr_004");
            expect(val(store.condition)).toBe(val(dayEquals(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:!= [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "notEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_005");
            expect(val(store.condition)).toBe(val(dayNotEqual(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:> [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "greater";
            store.arg1.value = date1;
            attr.id = attrId("attr_006");
            expect(val(store.condition)).toBe(val(dayGreaterThan(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:>= [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "greaterEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_006");
            expect(val(store.condition)).toBe(val(dayGreaterThanOrEqual(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:< [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "smaller";
            store.arg1.value = date1;
            attr.id = attrId("attr_007");
            expect(val(store.condition)).toBe(val(dayLessThan(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:<= [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "smallerEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_008");
            expect(val(store.condition)).toBe(val(dayLessThanOrEqual(attribute(attr.id), literal(date1))));
        });

        it("returns 'dat:>= [arg1] and day:<= [arg2]'", () => {
            const [date1, date2] = [new Date("2024-09-17T00:00:00.000Z"), new Date("2024-09-31T00:00:00.000Z")];
            store.filterFunction = "between";
            store.arg1.value = date1;
            store.arg2.value = date2;
            attr.id = attrId("attr_009");
            expect(val(store.condition)).toBe(
                val(
                    and(
                        dayGreaterThanOrEqual(attribute(attr.id), literal(date1)),
                        dayLessThanOrEqual(attribute(attr.id), literal(date2))
                    )
                )
            );
        });

        it("uses 'or' when have multiple attributes", () => {
            const [attr1, attr2] = [listAttr(() => new Date()), listAttr(() => new Date())];
            store = new DateInputFilterStore([attr1, attr2], null);
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "equal";
            store.arg1.value = date1;
            attr1.id = attrId("attr_010");
            attr2.id = attrId("attr_011");
            expect(val(store.condition)).toBe(
                val(or(dayEquals(attribute(attr1.id), literal(date1)), dayEquals(attribute(attr2.id), literal(date1))))
            );
        });
    });
});
