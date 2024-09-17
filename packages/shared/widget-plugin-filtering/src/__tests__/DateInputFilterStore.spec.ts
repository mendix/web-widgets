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
import smallerEqualExp from "../__fixtures__/date-multi-smallerEqual.json";
import btwnExp from "../__fixtures__/date-single-between.json";
import { withRealDates } from "../test-utils";
import { FilterCondition } from "mendix/filters";

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

        it("returns undefined by default", () => {
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
            const date1 = new Date("2024-09-17T14:00:00.000Z");
            store.filterFunction = "equal";
            store.arg1.value = date1;
            attr.id = attrId("attr_004");
            expect(val(store.condition)).toBe(val(dayEquals(attribute(attr.id), literal("2024-09-17T14:00:00.000Z"))));
        });

        it("returns 'day:!= [arg1]'", () => {
            const date1 = new Date("2024-09-17T15:00:00.000Z");
            store.filterFunction = "notEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_005");
            expect(val(store.condition)).toBe(
                val(dayNotEqual(attribute(attr.id), literal("2024-09-17T15:00:00.000Z")))
            );
        });

        it("returns 'day:> [arg1]'", () => {
            const date1 = new Date("2024-09-17T10:10:00.000Z");
            store.filterFunction = "greater";
            store.arg1.value = date1;
            attr.id = attrId("attr_006");
            expect(val(store.condition)).toBe(
                val(dayGreaterThan(attribute(attr.id), literal("2024-09-17T10:10:00.000Z")))
            );
        });

        it("returns 'day:>= [arg1]'", () => {
            const date1 = new Date("2024-09-17T17:02:30.000Z");
            store.filterFunction = "greaterEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_006");
            expect(val(store.condition)).toBe(
                val(dayGreaterThanOrEqual(attribute(attr.id), literal("2024-09-17T17:02:30.000Z")))
            );
        });

        it("returns 'day:< [arg1]'", () => {
            const date1 = new Date("2024-09-17T23:59:59.000Z");
            store.filterFunction = "smaller";
            store.arg1.value = date1;
            attr.id = attrId("attr_007");
            expect(val(store.condition)).toBe(
                val(dayLessThan(attribute(attr.id), literal("2024-09-17T23:59:59.000Z")))
            );
        });

        it("returns 'day:<= [arg1]'", () => {
            const date1 = new Date("2024-09-17T23:59:59.000Z");
            store.filterFunction = "smallerEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_008");
            expect(val(store.condition)).toBe(
                val(dayLessThanOrEqual(attribute(attr.id), literal("2024-09-17T23:59:59.000Z")))
            );
        });

        it("returns 'dat:>= [arg1] and day:<= [arg2]'", () => {
            const [date1, date2] = [new Date("2024-09-17T15:59:13.000Z"), new Date("2024-09-30T11:12:13.000Z")];
            store.filterFunction = "between";
            store.arg1.value = date1;
            store.arg2.value = date2;
            attr.id = attrId("attr_009");
            expect(val(store.condition)).toBe(
                val(
                    and(
                        dayGreaterThanOrEqual(attribute(attr.id), literal("2024-09-17T00:00:00.000Z")),
                        dayLessThan(attribute(attr.id), literal("2024-10-01T00:00:00.000Z")),
                        equals(literal("__RANGE_MARKER__"), literal("__RANGE_MARKER__"))
                    )
                )
            );
        });

        it("uses 'or' when have multiple attributes", () => {
            const [attr1, attr2] = [listAttr(() => new Date()), listAttr(() => new Date())];
            store = new DateInputFilterStore([attr1, attr2], null);
            const date1 = new Date("2024-09-17T01:01:01.000Z");
            store.filterFunction = "equal";
            store.arg1.value = date1;
            attr1.id = attrId("attr_010");
            attr2.id = attrId("attr_011");
            expect(val(store.condition)).toBe(
                val(
                    or(
                        dayEquals(attribute(attr1.id), literal("2024-09-17T01:01:01.000Z")),
                        dayEquals(attribute(attr2.id), literal("2024-09-17T01:01:01.000Z"))
                    )
                )
            );
        });
    });

    describe("fromViewState()", () => {
        let attr: ListAttributeValue<Date>;
        let store: DateInputFilterStore;

        beforeEach(() => {
            attr = listAttr(() => new Date());
            store = new DateInputFilterStore([attr], null);
            expect(store.filterFunction).toBe("equal");
        });

        it("restore state from multi-attribute exp", () => {
            store.fromViewState(withRealDates(smallerEqualExp) as unknown as FilterCondition);
            expect(store.filterFunction).toBe("smallerEqual");
            expect(store.arg1.value).toEqual(new Date("1960-10-08T23:00:00.000Z"));
        });

        it("restore state from between exp", () => {
            store.fromViewState(withRealDates(btwnExp) as unknown as FilterCondition);
            expect(store.filterFunction).toBe("between");
            expect(store.arg1.value).toEqual(new Date("2024-09-01T00:00:00.000Z"));
            expect(store.arg2.value).toEqual(new Date("2024-09-30T00:00:00.000Z"));
        });

        it("restore state between from multi attrs", () => {
            let exp = withRealDates(btwnExp) as unknown as FilterCondition;
            exp = {
                type: "function",
                name: "or",
                args: [exp, exp]
            };
            store.fromViewState(exp);
            expect(store.filterFunction).toBe("between");
            expect(store.arg1.value).toEqual(new Date("2024-09-01T00:00:00.000Z"));
            expect(store.arg2.value).toEqual(new Date("2024-09-30T00:00:00.000Z"));
        });
    });
});
