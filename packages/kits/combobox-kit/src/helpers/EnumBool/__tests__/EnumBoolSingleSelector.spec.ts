import { dynamic, EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { booleanProps, enumerationProps } from "../../__tests__/fixtures";
import { createSelector as createHarness } from "../../__tests__/harness";
import { EnumBooleanSingleSelector } from "../EnumBoolSingleSelector";

function createSelector(props: ComboboxContainerProps): EnumBooleanSingleSelector {
    return createHarness<EnumBooleanSingleSelector>(props).selector;
}

function enumAttribute(): EditableValueBuilder<string> {
    return new EditableValueBuilder<string>().withUniverse("red", "green", "blue").withValue("green");
}

describe("EnumBooleanSingleSelector with an enumeration", () => {
    it("builds options from the attribute universe", () => {
        const selector = createSelector(enumerationProps(enumAttribute().build(), { clearable: true }));

        expect(selector.type).toBe("single");
        expect(selector.status).toBe("available");
        expect(selector.options.getAll()).toEqual(["red", "green", "blue"]);
        expect(selector.currentId).toBe("green");
        expect(selector.clearable).toBe(true);
        expect(selector.readOnly).toBe(false);
    });

    it("takes captions from the attribute formatter", () => {
        const selector = createSelector(enumerationProps());

        expect(selector.caption.get("red")).toBe("Formatted red");
        expect(selector.caption.get(null)).toBe("Select...");
    });

    it("writes enumeration values", () => {
        const attr = enumAttribute().build();
        const selector = createSelector(enumerationProps(attr));

        selector.setValue("blue");
        expect(attr.setValue).toHaveBeenLastCalledWith("blue");

        selector.setValue(null);
        expect(attr.setValue).toHaveBeenLastCalledWith(undefined);
    });

    it("prefers the enumeration attribute when both attributes are defined", () => {
        const selector = createSelector(
            enumerationProps(enumAttribute().build(), {
                attributeBoolean: new EditableValueBuilder<boolean>().withUniverse(true, false).build()
            })
        );

        expect(selector.options.getAll()).toEqual(["red", "green", "blue"]);
    });

    it("is unavailable while the attribute is unavailable", () => {
        const selector = createSelector(
            enumerationProps(enumAttribute().isUnavailable().build(), { clearable: false })
        );

        expect(selector.status).toBe("unavailable");
        expect(selector.currentId).toBeNull();
    });

    it("is unavailable when the empty-option text is unavailable", () => {
        const selector = createSelector(
            enumerationProps(enumAttribute().build(), { emptyOptionText: dynamic.unavailable() })
        );

        expect(selector.status).toBe("unavailable");
    });

    it("passes read-only and validation through", () => {
        const selector = createSelector(
            enumerationProps(enumAttribute().isReadOnly().withValidation("Pick one").build())
        );

        expect(selector.readOnly).toBe(true);
        expect(selector.validation).toBe("Pick one");
    });

    it("filters by formatted caption", () => {
        const selector = createSelector(enumerationProps(enumAttribute().build(), { filterType: "contains" }));

        selector.options.setSearchTerm("gr");

        expect(selector.options.getAll()).toEqual(["green"]);
    });
});

describe("EnumBooleanSingleSelector with a boolean", () => {
    function booleanAttribute(value: boolean): EditableValueBuilder<boolean> {
        return new EditableValueBuilder<boolean>().withUniverse(true, false).withValue(value);
    }

    it("maps the universe to string options and is never clearable", () => {
        const selector = createSelector(booleanProps(booleanAttribute(true).build(), { clearable: true }));

        expect(selector.options.getAll()).toEqual(["true", "false"]);
        expect(selector.currentId).toBe("true");
        expect(selector.clearable).toBe(false);
    });

    it("writes boolean values", () => {
        const attr = booleanAttribute(true).build();
        const selector = createSelector(booleanProps(attr));

        selector.setValue("false");
        expect(attr.setValue).toHaveBeenLastCalledWith(false);

        selector.setValue("true");
        expect(attr.setValue).toHaveBeenLastCalledWith(true);
    });
});
