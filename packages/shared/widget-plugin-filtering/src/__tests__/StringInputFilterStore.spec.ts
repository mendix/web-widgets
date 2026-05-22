jest.mock("mendix/filters/builders");
import { ListAttributeValue } from "mendix";
import { and, attribute, equals, literal, notEqual, or } from "mendix/filters/builders";
import { configure } from "mobx";
import { attrId, listAttribute } from "@mendix/widget-plugin-test-utils";
import { StringInputFilterStore } from "../stores/input/StringInputFilterStore";

configure({ enforceActions: "never" });

describe("StringInputFilterStore", () => {
    describe("get condition()", () => {
        let attr: ListAttributeValue<string>;
        let store: StringInputFilterStore;

        beforeEach(() => {
            attr = listAttribute(() => "") as ListAttributeValue<string>;
            attr.id = attrId("attr_unset");
            store = new StringInputFilterStore([attr], null);
        });

        it("returns compound or() for 'empty' so it catches both null and ''", () => {
            store.filterFunction = "empty";
            attr.id = attrId("attr_empty_string");
            expect(store.condition).toEqual(
                or(equals(attribute(attr.id), literal(undefined)), equals(attribute(attr.id), literal("")))
            );
        });

        it("returns compound and() for 'notEmpty' so it excludes both null and ''", () => {
            store.filterFunction = "notEmpty";
            attr.id = attrId("attr_notempty_string");
            expect(store.condition).toEqual(
                and(notEqual(attribute(attr.id), literal(undefined)), notEqual(attribute(attr.id), literal("")))
            );
        });

        it("returns plain equals when filterFunction is 'equal'", () => {
            store.filterFunction = "equal";
            store.arg1.value = "abc";
            attr.id = attrId("attr_equal");
            expect(store.condition).toEqual(equals(attribute(attr.id), literal("abc")));
        });
    });

    describe("fromViewState()", () => {
        let attr: ListAttributeValue<string>;

        beforeEach(() => {
            attr = listAttribute(() => "") as ListAttributeValue<string>;
            attr.id = attrId("attr_view");
        });

        it("restores 'empty' from compound or() shape", () => {
            const cond = or(equals(attribute(attr.id), literal(undefined)), equals(attribute(attr.id), literal("")));
            const store = new StringInputFilterStore([attr], cond);
            expect(store.filterFunction).toBe("empty");
            expect(store.isInitialized).toBe(true);
        });

        it("restores 'empty' regardless of arg order in compound or()", () => {
            const cond = or(equals(attribute(attr.id), literal("")), equals(attribute(attr.id), literal(undefined)));
            const store = new StringInputFilterStore([attr], cond);
            expect(store.filterFunction).toBe("empty");
        });

        it("restores 'notEmpty' from compound and() shape", () => {
            const cond = and(
                notEqual(attribute(attr.id), literal(undefined)),
                notEqual(attribute(attr.id), literal(""))
            );
            const store = new StringInputFilterStore([attr], cond);
            expect(store.filterFunction).toBe("notEmpty");
            expect(store.isInitialized).toBe(true);
        });

        it("restores 'notEmpty' regardless of arg order in compound and()", () => {
            const cond = and(
                notEqual(attribute(attr.id), literal("")),
                notEqual(attribute(attr.id), literal(undefined))
            );
            const store = new StringInputFilterStore([attr], cond);
            expect(store.filterFunction).toBe("notEmpty");
        });

        it("does NOT confuse a between-style and() with notEmpty", () => {
            // sanity guard: arbitrary and(...) shape that doesn't match the compound contract
            // must NOT be misread as "notEmpty"
            const cond = and(
                notEqual(attribute(attr.id), literal("foo")),
                notEqual(attribute(attr.id), literal("bar"))
            );
            const store = new StringInputFilterStore([attr], cond);
            expect(store.filterFunction).not.toBe("notEmpty");
        });
    });
});
