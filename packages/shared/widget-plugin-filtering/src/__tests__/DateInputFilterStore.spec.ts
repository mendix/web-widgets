jest.mock("mendix/filters/builders");
import { attrId, listAttr } from "@mendix/widget-plugin-test-utils";
import { ListAttributeValue } from "mendix";
import {
    and,
    attribute,
    dayEquals,
    dayGreaterThan,
    dayGreaterThanOrEqual,
    dayLessThan,
    dayLessThanOrEqual,
    dayNotEqual,
    equals,
    literal,
    notEqual,
    or
} from "mendix/filters/builders";
import { configure } from "mobx";
import { DateInputFilterStore } from "../stores/input/DateInputFilterStore";

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
            expect(store.condition).toEqual(undefined);
        });

        it("returns '= empty' exp when fn is 'empty'", () => {
            store.filterFunction = "empty";
            attr.id = attrId("attr_002");
            expect(store.condition).toEqual(equals(attribute(attr.id), literal(undefined)));
        });

        it("returns '!= empty' exp when fn is 'notEmpty'", () => {
            store.filterFunction = "notEmpty";
            attr.id = attrId("attr_003");
            expect(store.condition).toEqual(notEqual(attribute(attr.id), literal(undefined)));
        });

        it("returns 'day:= [arg1]'", () => {
            const date1 = new Date("2024-09-17T14:00:00.000Z");
            store.filterFunction = "equal";
            store.arg1.value = date1;
            attr.id = attrId("attr_004");
            expect(store.condition).toEqual(
                dayEquals(attribute(attr.id), literal(new Date("2024-09-17T14:00:00.000Z")))
            );
        });

        it("returns 'day:!= [arg1]'", () => {
            const date1 = new Date("2024-09-17T15:00:00.000Z");
            store.filterFunction = "notEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_005");
            expect(store.condition).toEqual(
                dayNotEqual(attribute(attr.id), literal(new Date("2024-09-17T15:00:00.000Z")))
            );
        });

        it("returns 'day:> [arg1]'", () => {
            const date1 = new Date("2024-09-17T10:10:00.000Z");
            store.filterFunction = "greater";
            store.arg1.value = date1;
            attr.id = attrId("attr_006");
            expect(store.condition).toEqual(
                dayGreaterThan(attribute(attr.id), literal(new Date("2024-09-17T10:10:00.000Z")))
            );
        });

        it("returns 'day:>= [arg1]'", () => {
            const date1 = new Date("2024-09-17T17:02:30.000Z");
            store.filterFunction = "greaterEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_006");
            expect(store.condition).toEqual(
                dayGreaterThanOrEqual(attribute(attr.id), literal(new Date("2024-09-17T17:02:30.000Z")))
            );
        });

        it("returns 'day:< [arg1]'", () => {
            const date1 = new Date("2024-09-17T23:59:59.000Z");
            store.filterFunction = "smaller";
            store.arg1.value = date1;
            attr.id = attrId("attr_007");
            expect(store.condition).toEqual(
                dayLessThan(attribute(attr.id), literal(new Date("2024-09-17T23:59:59.000Z")))
            );
        });

        it("returns 'day:<= [arg1]'", () => {
            const date1 = new Date("2024-09-17T23:59:59.000Z");
            store.filterFunction = "smallerEqual";
            store.arg1.value = date1;
            attr.id = attrId("attr_008");
            expect(store.condition).toEqual(
                dayLessThanOrEqual(attribute(attr.id), literal(new Date("2024-09-17T23:59:59.000Z")))
            );
        });

        it("returns 'dat:>= [arg1] and day:<= [arg2]'", () => {
            const [date1, date2] = [new Date("2024-09-17T15:59:13.000Z"), new Date("2024-09-30T11:12:13.000Z")];
            store.filterFunction = "between";
            store.arg1.value = date1;
            store.arg2.value = date2;
            attr.id = attrId("attr_009");
            expect(store.condition).toEqual(
                and(
                    dayGreaterThanOrEqual(attribute(attr.id), literal(new Date("2024-09-17T15:59:13.000Z"))),
                    dayLessThan(attribute(attr.id), literal(new Date("2024-10-01T11:12:13.000Z"))),
                    equals(literal("__RANGE_MARKER__"), literal("__RANGE_MARKER__"))
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
            expect(store.condition).toEqual(
                or(
                    dayEquals(attribute(attr1.id), literal(new Date("2024-09-17T01:01:01.000Z"))),
                    dayEquals(attribute(attr2.id), literal(new Date("2024-09-17T01:01:01.000Z")))
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
            const exp = or(
                dayLessThanOrEqual(attribute(attrId("attr_jei_5")), literal(new Date("1961-04-12T23:00:00.000Z"))),
                dayLessThanOrEqual(attribute(attrId("attr_jei_6")), literal(new Date("1961-04-12T23:00:00.000Z")))
            );
            store.fromViewState(exp);
            expect(store.filterFunction).toBe("smallerEqual");
            expect(store.arg1.value).toEqual(new Date("1961-04-12T23:00:00.000Z"));
        });

        it("restore state from between exp", () => {
            const exp = and(
                dayGreaterThanOrEqual(attribute(attrId("attr_jei_5")), literal(new Date("2024-09-01T00:00:00.000Z"))),
                dayLessThan(attribute(attrId("attr_jei_5")), literal(new Date("2024-10-01T00:00:00.000Z"))),
                equals(literal("__RANGE_MARKER__"), literal("__RANGE_MARKER__"))
            );
            store.fromViewState(exp);
            expect(store.filterFunction).toBe("between");
            expect(store.arg1.value).toEqual(new Date("2024-09-01T00:00:00.000Z"));
            expect(store.arg2.value).toEqual(new Date("2024-09-30T00:00:00.000Z"));
        });

        it("restore state between from multi attrs", () => {
            const exp = or(
                and(
                    dayGreaterThanOrEqual(
                        attribute(attrId("attr_jei_5")),
                        literal(new Date("2024-09-01T00:00:00.000Z"))
                    ),
                    dayLessThan(attribute(attrId("attr_jei_5")), literal(new Date("2024-10-01T00:00:00.000Z"))),
                    equals(literal("__RANGE_MARKER__"), literal("__RANGE_MARKER__"))
                ),
                and(
                    dayGreaterThanOrEqual(
                        attribute(attrId("attr_jei_8")),
                        literal(new Date("2024-09-01T00:00:00.000Z"))
                    ),
                    dayLessThan(attribute(attrId("attr_jei_8")), literal(new Date("2024-10-01T00:00:00.000Z"))),
                    equals(literal("__RANGE_MARKER__"), literal("__RANGE_MARKER__"))
                )
            );
            store.fromViewState(exp);
            expect(store.filterFunction).toBe("between");
            expect(store.arg1.value).toEqual(new Date("2024-09-01T00:00:00.000Z"));
            expect(store.arg2.value).toEqual(new Date("2024-09-30T00:00:00.000Z"));
        });
    });
});
