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
    dayLessThanOrEqual
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
            attr.id = attrId('"attr_unset"');
            store = new DateInputFilterStore([attr], null);
        });

        it("return undefined by default", () => {
            expect(store.condition).toBe(undefined);
        });

        it("returns '= empty' exp when fn is 'empty'", () => {
            store.filterFunction = "empty";
            attr.id = attrId('"attr_002"');
            expect(val(store.condition)).toBe(val(equals(attribute(attr.id), literal(undefined))));
        });

        it("returns '!= empty' exp when fn is 'notEmpty'", () => {
            store.filterFunction = "notEmpty";
            attr.id = attrId('"attr_003"');
            expect(val(store.condition)).toBe(val(notEqual(attribute(attr.id), literal(undefined))));
        });

        it("returns 'day:= [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "equal";
            store.arg1.value = date1;
            attr.id = attrId('"attr_004"');
            expect(val(store.condition)).toBe(val(dayEquals(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:!= [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "notEqual";
            store.arg1.value = date1;
            attr.id = attrId('"attr_005"');
            expect(val(store.condition)).toBe(val(dayNotEqual(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:> [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "notEqual";
            store.arg1.value = date1;
            attr.id = attrId('"attr_006"');
            expect(val(store.condition)).toBe(val(dayGreaterThan(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:>= [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "notEqual";
            store.arg1.value = date1;
            attr.id = attrId('"attr_006"');
            expect(val(store.condition)).toBe(val(dayGreaterThanOrEqual(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:< [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "notEqual";
            store.arg1.value = date1;
            attr.id = attrId('"attr_007"');
            expect(val(store.condition)).toBe(val(dayLessThan(attribute(attr.id), literal(date1))));
        });

        it("returns 'day:<= [arg1]'", () => {
            const date1 = new Date("2024-09-17T00:00:00.000Z");
            store.filterFunction = "notEqual";
            store.arg1.value = date1;
            attr.id = attrId('"attr_008"');
            expect(val(store.condition)).toBe(val(dayLessThanOrEqual(attribute(attr.id), literal(date1))));
        });

        it.todo("returns 'dat:>= [arg1] and day:<= [arg2]'");

        it.todo("uses 'or' when have multiple attributes");
    });
});
