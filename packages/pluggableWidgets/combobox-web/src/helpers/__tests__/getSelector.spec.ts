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
} from "./fixtures";
import { AssociationMultiSelector } from "../Association/AssociationMultiSelector";
import { AssociationSingleSelector } from "../Association/AssociationSingleSelector";
import { DatabaseMultiSelectionSelector } from "../Database/DatabaseMultiSelectionSelector";
import { DatabaseSingleSelectionSelector } from "../Database/DatabaseSingleSelectionSelector";
import { EnumBooleanSingleSelector } from "../EnumBool/EnumBoolSingleSelector";
import { getSelector } from "../getSelector";
import { StaticSingleSelector } from "../Static/StaticSingleSelector";

describe("getSelector", () => {
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
    ])("routes %s to its selector", (_label, props, SelectorClass, type) => {
        const selector = getSelector(props);

        expect(selector).toBeInstanceOf(SelectorClass);
        expect(selector.type).toBe(type);
    });

    it("throws for an unsupported options source type", () => {
        const props = baseProps({ source: "context", optionsSourceType: "unknown" as never });

        expect(() => getSelector(props)).toThrow("'optionsSourceType' of type 'unknown' is not supported");
    });

    it("throws for an unsupported source", () => {
        const props = baseProps({ source: "unknown" as never });

        expect(() => getSelector(props)).toThrow("Source of type 'unknown' is not supported");
    });
});
