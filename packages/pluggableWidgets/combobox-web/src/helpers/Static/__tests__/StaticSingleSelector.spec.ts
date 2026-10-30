import { Big } from "big.js";
import { EditableValue } from "mendix";
import { dynamic, EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { staticEntries, staticEntry, staticProps } from "../../__tests__/fixtures";
import { StaticSingleSelector } from "../StaticSingleSelector";

type StaticValue = string | Big | boolean | Date;

function attribute(value?: StaticValue): EditableValueBuilder<StaticValue> {
    const builder = new EditableValueBuilder<StaticValue>().withFormatter({
        format: (v?: StaticValue) => (v === undefined ? "" : String(v)),
        parse: jest.fn(),
        type: "string"
    } as unknown as EditableValue<StaticValue>["formatter"]);
    return value === undefined ? builder : builder.withValue(value);
}

describe("StaticSingleSelector", () => {
    it("uses the datasource indices as option ids", () => {
        const selector = new StaticSingleSelector();
        selector.updateProps(staticProps(attribute().build()));

        expect(selector.type).toBe("single");
        expect(selector.selectorType).toBe("static");
        expect(selector.status).toBe("available");
        expect(selector.options.getAll()).toEqual(["0", "1", "2"]);
        expect(selector.caption.get("1")).toBe("Two");
        expect(selector.caption.get("9")).toBe("<...>");
        expect(selector.currentId).toBeNull();
    });

    it.each([
        ["string", "two", staticEntries],
        ["Big", new Big(2), [staticEntry(new Big(1), "1"), staticEntry(new Big(2), "2")]],
        [
            "Date",
            new Date(2000, 1, 2),
            [staticEntry(new Date(2000, 1, 1), "1st"), staticEntry(new Date(2000, 1, 2), "2nd")]
        ],
        ["boolean", false, [staticEntry(true, "Yes"), staticEntry(false, "No")]]
    ] as const)("resolves currentId by value equality for %s", (_type, value, entries) => {
        const selector = new StaticSingleSelector();
        selector.updateProps(staticProps(attribute(value).build(), { optionsSourceStaticDataSource: [...entries] }));

        expect(selector.currentId).toBe("1");
    });

    it("writes the entry value and updates currentId synchronously", () => {
        const attr = attribute("one").build();
        const selector = new StaticSingleSelector();
        selector.updateProps(staticProps(attr));
        expect(selector.currentId).toBe("0");

        selector.setValue("2");
        expect(attr.setValue).toHaveBeenLastCalledWith("three");
        expect(selector.currentId).toBe("2");

        selector.setValue(null);
        expect(attr.setValue).toHaveBeenLastCalledWith(undefined);
        expect(selector.currentId).toBeNull();
    });

    it("keeps the previous currentId when the attribute value is cleared externally", () => {
        // Quirk: only setValue clears currentId; an external clear leaves the old selection visible.
        const selector = new StaticSingleSelector();
        selector.updateProps(staticProps(attribute("two").build()));
        expect(selector.currentId).toBe("1");

        selector.updateProps(staticProps(attribute(undefined).build()));

        expect(selector.currentId).toBe("1");
    });

    it("uses the attribute display value as the empty caption when there is one", () => {
        // Quirk: the display value of the bound attribute overrides the empty-option text.
        const withValue = new StaticSingleSelector();
        withValue.updateProps(staticProps(attribute("two").build()));
        expect(withValue.caption.get(null)).toBe("two");

        const withoutValue = new StaticSingleSelector();
        withoutValue.updateProps(staticProps(attribute().build()));
        expect(withoutValue.caption.get(null)).toBe("Select...");
    });

    it("is never clearable for a boolean attribute", () => {
        const selector = new StaticSingleSelector();
        selector.updateProps(
            staticProps(attribute(true).build(), {
                clearable: true,
                optionsSourceStaticDataSource: [staticEntry(true, "Yes"), staticEntry(false, "No")]
            })
        );

        expect(selector.clearable).toBe(false);
    });

    it("reports the attribute type", () => {
        const stringSelector = new StaticSingleSelector();
        stringSelector.updateProps(staticProps(attribute("one").build()));
        expect(stringSelector.attributeType).toBe("string");

        const booleanSelector = new StaticSingleSelector();
        booleanSelector.updateProps(
            staticProps(new EditableValueBuilder<StaticValue>().withUniverse(true, false).withValue(true).build())
        );
        expect(booleanSelector.attributeType).toBe("boolean");

        const dateSelector = new StaticSingleSelector();
        dateSelector.updateProps(staticProps(new EditableValueBuilder<StaticValue>().withValue(new Date()).build()));
        expect(dateSelector.attributeType).toBe("date");
    });

    it("passes read-only and validation through", () => {
        const selector = new StaticSingleSelector();
        selector.updateProps(staticProps(attribute("one").isReadOnly().withValidation("Required").build()));

        expect(selector.readOnly).toBe(true);
        expect(selector.validation).toBe("Required");
    });

    it.each([
        ["attribute", staticProps(attribute("one").isUnavailable().build())],
        ["empty-option text", staticProps(attribute("one").build(), { emptyOptionText: dynamic.unavailable() })],
        [
            "entry value",
            staticProps(attribute("one").build(), {
                optionsSourceStaticDataSource: [
                    { ...staticEntry("one", "One"), staticDataSourceValue: dynamic.unavailable() }
                ]
            })
        ],
        [
            "entry caption",
            staticProps(attribute("one").build(), {
                optionsSourceStaticDataSource: [
                    { ...staticEntry("one", "One"), staticDataSourceCaption: dynamic.unavailable() }
                ]
            })
        ]
    ])("is unavailable while the %s is unavailable", (_label, props) => {
        const selector = new StaticSingleSelector();
        selector.updateProps(props);

        expect(selector.status).toBe("unavailable");
        expect(selector.currentId).toBeNull();
        expect(selector.clearable).toBe(false);
    });

    it.each([
        ["contains", "w", ["1"]],
        ["containsExact", "T", ["1", "2"]],
        ["startsWith", "th", ["2"]],
        ["none", "zzz", ["0", "1", "2"]]
    ] as const)("filters by entry caption with filterType '%s'", (filterType, term, expected) => {
        const selector = new StaticSingleSelector();
        selector.updateProps(staticProps(attribute().build(), { filterType }));

        selector.options.setSearchTerm(term);

        expect(selector.options.getAll()).toEqual(expected);
    });
});
