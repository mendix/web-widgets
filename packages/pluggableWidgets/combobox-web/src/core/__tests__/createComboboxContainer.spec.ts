import {
    ReferenceSetValueBuilder,
    SelectionMultiValueBuilder,
    SelectionSingleValueBuilder
} from "@mendix/widget-plugin-test-utils";
import {
    associationMultiProps,
    associationSingleProps,
    baseProps,
    booleanProps,
    databaseMultiProps,
    databaseSingleProps,
    enumerationProps,
    itemA,
    staticProps
} from "../../helpers/__tests__/fixtures";
import { AssociationMultiSelector } from "../../helpers/Association/AssociationMultiSelector";
import { AssociationSingleSelector } from "../../helpers/Association/AssociationSingleSelector";
import { DatabaseMultiSelectionSelector } from "../../helpers/Database/DatabaseMultiSelectionSelector";
import { DatabaseSingleSelectionSelector } from "../../helpers/Database/DatabaseSingleSelectionSelector";
import { EnumBooleanSingleSelector } from "../../helpers/EnumBool/EnumBoolSingleSelector";
import { StaticSingleSelector } from "../../helpers/Static/StaticSingleSelector";
import { createComboboxContainer } from "../createComboboxContainer";
import { CB_TOKENS as CB } from "../tokens";

describe("createComboboxContainer", () => {
    it.each([
        ["context + enumeration", enumerationProps(), EnumBooleanSingleSelector, "single"],
        ["context + boolean", booleanProps(), EnumBooleanSingleSelector, "single"],
        ["context + association (Reference)", associationSingleProps(), AssociationSingleSelector, "single"],
        [
            "context + association (ReferenceSet)",
            associationMultiProps({ attr: new ReferenceSetValueBuilder().withValue([itemA]).build() }),
            AssociationMultiSelector,
            "multi"
        ],
        [
            "database + Single selection",
            databaseSingleProps({ selection: new SelectionSingleValueBuilder().build() }),
            DatabaseSingleSelectionSelector,
            "single"
        ],
        [
            "database + Multi selection",
            databaseMultiProps({ selection: new SelectionMultiValueBuilder().build() }),
            DatabaseMultiSelectionSelector,
            "multi"
        ],
        [
            "database without selection",
            databaseSingleProps({ selection: undefined }),
            DatabaseSingleSelectionSelector,
            "single"
        ],
        ["static", staticProps(), StaticSingleSelector, "single"]
    ])("binds %s to its selector", (_label, props, SelectorClass, mode) => {
        const container = createComboboxContainer(props);
        const selector = container.get(CB.selector);

        expect(selector).toBeInstanceOf(SelectorClass);
        expect(selector.type).toBe(mode);
        expect(container.get(CB.config).mode).toBe(mode);
        expect(container.get(CB.core).selector).toBe(selector);
    });

    it("feeds the selector the props it was created with", () => {
        const selector = createComboboxContainer(enumerationProps()).get(CB.selector);

        expect(selector.status).toBe("available");
        expect(selector.currentId).toBe("green");
    });

    it("pushes new props through the gate and the selector in one go, and ignores a props object it has seen", () => {
        const props = enumerationProps();
        const container = createComboboxContainer(props);
        const selector = container.get(CB.selector);
        const updateProps = jest.spyOn(selector, "updateProps");

        container.setProps(props);
        expect(updateProps).not.toHaveBeenCalled();

        const next = enumerationProps(undefined, { ariaLabel: { status: "available", value: "Colour" } as never });
        container.setProps(next);
        expect(updateProps).toHaveBeenCalledWith(next);
        expect(container.get(CB.gate).props.ariaLabel?.value).toBe("Colour");
    });

    it("throws for an unsupported options source type", () => {
        const props = baseProps({ source: "context", optionsSourceType: "unknown" as never });

        expect(() => createComboboxContainer(props)).toThrow("'optionsSourceType' of type 'unknown' is not supported");
    });

    it("throws for an unsupported source", () => {
        const props = baseProps({ source: "unknown" as never });

        expect(() => createComboboxContainer(props)).toThrow("Source of type 'unknown' is not supported");
    });
});
