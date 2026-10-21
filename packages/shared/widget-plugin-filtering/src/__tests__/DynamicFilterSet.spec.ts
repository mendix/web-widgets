jest.mock("mendix/filters/builders");
import { Big } from "big.js";
import { ListAttributeValue } from "mendix";
import { and, attribute, contains, equals, greaterThan, lessThan, literal, or } from "mendix/filters/builders";
import { configure } from "mobx";
import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import { attrId, listAttribute } from "@mendix/widget-plugin-test-utils";
import { DynamicFilterRow, DynamicFilterSet } from "../dynamic/DynamicFilterSet";
import { FilterFieldConfig } from "../dynamic/typings";
import { NumberInputFilterStore } from "../stores/input/NumberInputFilterStore";
import { StringInputFilterStore } from "../stores/input/StringInputFilterStore";

configure({ enforceActions: "never" });

function attr(id: string, type: ListAttributeValue["type"], universe?: unknown[]): ListAttributeValue {
    const a = listAttribute(() => "") as unknown as ListAttributeValue;
    a.id = attrId(id);
    (a as { type: string }).type = type;
    (a as { universe?: unknown[] }).universe = universe;
    return a;
}

function field(key: string, a: ListAttributeValue, label = key): FilterFieldConfig {
    return { key, attribute: a, label };
}

const firstName = attr("firstName", "String");
const lastName = attr("lastName", "String");
const amount = attr("amount", "Decimal");
const created = attr("created", "DateTime");
const status = attr("status", "Enum", ["open", "in_progress", "closed"]);
const priority = attr("priority", "Enum", ["low", "high"]);

function makeSet(): DynamicFilterSet {
    return new DynamicFilterSet(
        [
            field("firstName", firstName),
            field("lastName", lastName),
            field("amount", amount),
            field("created", created),
            field("createdRange", created),
            field("status", status),
            field("priority", priority)
        ],
        []
    );
}

function addRow(set: DynamicFilterSet, key: string): DynamicFilterRow {
    const row = set.addRow();
    set.setField(row.id, key);
    return row;
}

describe("DynamicFilterSet", () => {
    let warn: jest.SpyInstance;
    beforeEach(() => {
        warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    });
    afterEach(() => warn.mockRestore());

    describe("Filter Fields", () => {
        it("offers two fields backed by the same attribute under their own keys", () => {
            const set = makeSet();
            expect(set.fields.map(f => f.key)).toEqual(expect.arrayContaining(["created", "createdRange"]));
            const a = addRow(set, "created");
            const b = addRow(set, "createdRange");
            expect(a.fieldKey).toBe("created");
            expect(b.fieldKey).toBe("createdRange");
        });

        it("leaves out fields that can't be filtered and warns once", () => {
            const blocked = attr("blocked", "String");
            (blocked as { filterable: boolean }).filterable = false;
            const set = new DynamicFilterSet([field("blocked", blocked), field("firstName", firstName)]);
            expect(set.fields.map(f => f.key)).toEqual(["firstName"]);
            expect(set.fields.map(f => f.key)).toEqual(["firstName"]);
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0][0]).toContain('"blocked"');
        });
    });

    describe("kind inference", () => {
        it("creates the store matching the attribute type", () => {
            const set = makeSet();
            expect(addRow(set, "firstName").store).toBeInstanceOf(StringInputFilterStore);
            expect(addRow(set, "amount").store).toBeInstanceOf(NumberInputFilterStore);
            expect(addRow(set, "status").store).toBeInstanceOf(EnumFilterStore);
        });

        it("uses the filter widgets' default operators", () => {
            const set = makeSet();
            expect((addRow(set, "firstName").store as StringInputFilterStore).filterFunction).toBe("contains");
            expect((addRow(set, "amount").store as NumberInputFilterStore).filterFunction).toBe("equal");
        });
    });

    describe("conditions", () => {
        it("is undefined for an empty set", () => {
            expect(makeSet().condWithMeta.cond).toBeUndefined();
        });

        it("joins complete rows with AND and skips incomplete rows", () => {
            const set = makeSet();
            const name = addRow(set, "firstName");
            (name.store as StringInputFilterStore).arg1.value = "Jo";
            addRow(set, "lastName"); // incomplete
            const amt = addRow(set, "amount");
            const num = amt.store as NumberInputFilterStore;
            num.filterFunction = "greater";
            num.arg1.value = new Big(10);

            expect(set.condWithMeta.cond).toEqual(
                and(
                    contains(attribute(firstName.id), literal("Jo")),
                    greaterThan(attribute(amount.id), literal(new Big(10)))
                )
            );
        });

        it("allows the same field twice", () => {
            const set = makeSet();
            const a = addRow(set, "amount").store as NumberInputFilterStore;
            const b = addRow(set, "amount").store as NumberInputFilterStore;
            a.filterFunction = "greater";
            a.arg1.value = new Big(10);
            b.filterFunction = "smaller";
            b.arg1.value = new Big(100);
            expect(set.condWithMeta.cond).toEqual(
                and(
                    greaterThan(attribute(amount.id), literal(new Big(10))),
                    lessThan(attribute(amount.id), literal(new Big(100)))
                )
            );
        });

        it("matches any selected enumeration value", () => {
            const set = makeSet();
            const store = addRow(set, "status").store as EnumFilterStore;
            store.setSelected(["open", "in_progress"]);
            expect(set.condWithMeta.cond).toEqual(
                or(equals(attribute(status.id), literal("open")), equals(attribute(status.id), literal("in_progress")))
            );
        });
    });

    describe("add, remove, clear", () => {
        it("removes a row by id and clears all rows", () => {
            const set = makeSet();
            const a = addRow(set, "firstName");
            addRow(set, "amount");
            addRow(set, "status");
            set.removeRow(a.id);
            expect(set.rows.map(r => r.fieldKey)).toEqual(["amount", "status"]);
            set.clear();
            expect(set.rows).toHaveLength(0);
            expect(set.condWithMeta.cond).toBeUndefined();
        });
    });

    describe("changing a row's field", () => {
        it("keeps operator and value for the same kind", () => {
            const set = makeSet();
            const row = addRow(set, "firstName");
            (row.store as StringInputFilterStore).arg1.value = "John";
            set.setField(row.id, "lastName");
            const store = row.store as StringInputFilterStore;
            expect(store.filterFunction).toBe("contains");
            expect(store.arg1.value).toBe("John");
            expect(set.condWithMeta.cond).toEqual(contains(attribute(lastName.id), literal("John")));
        });

        it("resets when the kind changes", () => {
            const set = makeSet();
            const row = addRow(set, "firstName");
            (row.store as StringInputFilterStore).arg1.value = "John";
            set.setField(row.id, "created");
            expect(row.kind).toBe("date");
            expect(set.condWithMeta.cond).toBeUndefined();
        });

        it("always resets between enumeration fields", () => {
            const set = makeSet();
            const row = addRow(set, "status");
            (row.store as EnumFilterStore).setSelected(["open"]);
            set.setField(row.id, "priority");
            expect([...(row.store as EnumFilterStore).selected]).toEqual([]);
            expect(set.condWithMeta.cond).toBeUndefined();
        });
    });

    describe("enumeration options", () => {
        it("replaces the automatic values", () => {
            const set = new DynamicFilterSet(
                [field("status", status)],
                [{ fieldKey: "status", caption: "Active", value: "open" }]
            );
            const store = addRow(set, "status").store as EnumFilterStore;
            expect(store.allOptions.map(o => [o.caption, o.value])).toEqual([["Active", "open"]]);
        });

        it("ignores options for fields that aren't enumerations, with a warning", () => {
            const set = new DynamicFilterSet(
                [field("firstName", firstName)],
                [{ fieldKey: "firstName", caption: "X", value: "x" }]
            );
            addRow(set, "firstName");
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('"firstName"'));
        });
    });

    describe("serialization", () => {
        it("round-trips rows in order", () => {
            const set = makeSet();
            (addRow(set, "status").store as EnumFilterStore).setSelected(["open"]);
            (addRow(set, "firstName").store as StringInputFilterStore).arg1.value = "Jo";
            const json = set.toJSON();
            expect(json).toEqual([
                { field: "status", data: ["open"] },
                { field: "firstName", data: ["contains", "Jo", null] }
            ]);

            const restored = makeSet();
            restored.fromJSON(json);
            expect(restored.rows.map(r => r.fieldKey)).toEqual(["status", "firstName"]);
            expect(restored.condWithMeta.cond).toEqual(set.condWithMeta.cond);
        });

        it("keeps incomplete rows", () => {
            const set = makeSet();
            addRow(set, "lastName");
            const restored = makeSet();
            restored.fromJSON(set.toJSON());
            expect(restored.rows.map(r => r.fieldKey)).toEqual(["lastName"]);
        });

        it("drops rows for unknown fields, invalid data and disallowed values", () => {
            const set = makeSet();
            set.fromJSON([
                { field: "region", data: ["x"] },
                { field: "amount", data: ["contains", "1", null] },
                { field: "status", data: ["archived"] },
                { field: "priority", data: ["high", "urgent"] },
                { field: "firstName", data: ["equal", "Ann", null] }
            ]);
            expect(set.rows.map(r => r.fieldKey)).toEqual(["priority", "firstName"]);
            expect([...(set.rows[0].store as EnumFilterStore).selected]).toEqual(["high"]);
        });

        it("restores an empty set from missing or malformed data", () => {
            const set = makeSet();
            addRow(set, "firstName");
            set.fromJSON(undefined);
            expect(set.rows).toHaveLength(0);
            set.fromJSON({ not: "an array" });
            expect(set.rows).toHaveLength(0);
        });
    });

    describe("view-state hydration", () => {
        it("restores rows from the condition and meta", () => {
            const set = makeSet();
            (addRow(set, "status").store as EnumFilterStore).setSelected(["open"]);
            addRow(set, "lastName"); // incomplete
            (addRow(set, "firstName").store as StringInputFilterStore).arg1.value = "Jo";
            const snapshot = set.condWithMeta;

            const restored = makeSet();
            restored.hydrate(snapshot);
            expect(restored.rows.map(r => r.fieldKey)).toEqual(["status", "lastName", "firstName"]);
            expect(restored.condWithMeta.cond).toEqual(snapshot.cond);
        });
    });
});
