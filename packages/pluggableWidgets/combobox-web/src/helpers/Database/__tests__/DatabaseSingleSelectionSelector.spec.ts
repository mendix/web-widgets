import {
    dynamic,
    EditableValueBuilder,
    list,
    listAttribute,
    obj,
    SelectionSingleValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { ListAttributeValue, ObjectItem } from "mendix";
import { ComboboxContainerProps } from "../../../../typings/ComboboxProps";
import { DatabaseSingleSelectionSelector } from "../DatabaseSingleSelectionSelector";

type PropsOverrides = {
    items: ObjectItem[];
    values: Map<string, string>;
    targetValue?: string;
    selection?: ReturnType<SelectionSingleValueBuilder["build"]>;
};

function buildProps({ items, values, targetValue, selection }: PropsOverrides): ComboboxContainerProps {
    const valueAttr = listAttribute<string>(item => values.get(item.id) ?? "") as ListAttributeValue<string | Big>;
    (valueAttr as unknown as { id: string }).id = "valueAttrId" as any;

    const captionAttr = listAttribute<string>(item => `caption_${item.id}`);
    (captionAttr as unknown as { id: string }).id = "captionAttrId" as any;

    const targetAttr =
        targetValue === undefined
            ? new EditableValueBuilder<string>().build()
            : new EditableValueBuilder<string>().withValue(targetValue).build();

    return {
        name: "comboBox",
        id: "comboBox1",
        source: "database",
        optionsSourceType: "association",
        optionsSourceDatabaseDataSource: list(items),
        optionsSourceDatabaseItemSelection: selection ?? new SelectionSingleValueBuilder().build(),
        optionsSourceDatabaseCaptionType: "attribute",
        optionsSourceDatabaseCaptionAttribute: captionAttr,
        optionsSourceDatabaseValueAttribute: valueAttr,
        databaseAttributeString: targetAttr as any,
        emptyOptionText: dynamic("Select..."),
        optionsSourceDatabaseCustomContentType: "no",
        optionsSourceAssociationCustomContentType: "no",
        staticDataSourceCustomContentType: "no",
        optionsSourceAssociationCaptionType: "attribute",
        clearable: true,
        filterType: "contains",
        lazyLoading: false,
        loadingType: "spinner",
        customEditability: "default",
        customEditabilityExpression: dynamic(false),
        filterInputDebounceInterval: 200,
        selectedItemsStyle: "text",
        readOnlyStyle: "bordered",
        selectionMethod: "checkbox",
        selectAllButton: false,
        selectAllButtonCaption: dynamic("Select All"),
        ariaRequired: dynamic(true),
        showFooter: false,
        selectedItemsSorting: "none",
        attributeEnumeration: new EditableValueBuilder<string>().build(),
        attributeBoolean: new EditableValueBuilder<boolean>().build(),
        attributeAssociation: undefined as any,
        staticAttribute: new EditableValueBuilder<string>().build(),
        optionsSourceStaticDataSource: []
    } as ComboboxContainerProps;
}

describe("DatabaseSingleSelectionSelector.updateProps — external target-attribute changes", () => {
    const optionA = obj("A");
    const optionB = obj("B");
    const items = [optionA, optionB];
    const values = new Map<string, string>([
        [optionA.id, "v1"],
        [optionB.id, "v2"]
    ]);

    it("resolves currentId from targetAttribute.value on initial updateProps", () => {
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });
        selector.updateProps(buildProps({ items, values, targetValue: "v1" }));

        expect(selector.currentId).toBe(optionA.id);
    });

    it("refreshes currentId when targetAttribute.value changes externally after a selection exists", () => {
        // WC-3355: without this behavior, an external value change (e.g. from a microflow)
        // leaves currentId pointing at the stale option.
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });
        const selection = new SelectionSingleValueBuilder().build();

        selector.updateProps(buildProps({ items, values, targetValue: "v1", selection }));
        expect(selector.currentId).toBe(optionA.id);

        selector.updateProps(buildProps({ items, values, targetValue: "v2", selection }));
        expect(selector.currentId).toBe(optionB.id);
    });

    it("falls back to loadSelectedValue when new value is not in loaded options", () => {
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });
        const selection = new SelectionSingleValueBuilder().build();
        const soleItems = [optionA];
        const soleValues = new Map<string, string>([[optionA.id, "v1"]]);

        selector.updateProps(buildProps({ items: soleItems, values: soleValues, targetValue: "v1", selection }));
        const loadSpy = jest.spyOn(selector.options, "loadSelectedValue");

        selector.updateProps(buildProps({ items: soleItems, values: soleValues, targetValue: "v-unknown", selection }));

        expect(loadSpy).toHaveBeenCalledWith("v-unknown", expect.anything());
    });

    it("clears currentId and selection when targetAttribute.value is cleared externally", () => {
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });
        const selection = new SelectionSingleValueBuilder().build();
        const setSelectionSpy = jest.spyOn(selection, "setSelection");

        selector.updateProps(buildProps({ items, values, targetValue: "v1", selection }));
        expect(selector.currentId).toBe(optionA.id);

        selector.updateProps(buildProps({ items, values, targetValue: undefined, selection }));

        expect(selector.currentId).toBeNull();
        expect(setSelectionSpy).toHaveBeenCalledWith(undefined);
    });

    it("does not re-resolve currentId when targetAttribute.value is unchanged", () => {
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });
        const selection = new SelectionSingleValueBuilder().build();

        selector.updateProps(buildProps({ items, values, targetValue: "v1", selection }));
        const getAllSpy = jest.spyOn(selector.options, "getAll");

        selector.updateProps(buildProps({ items, values, targetValue: "v1", selection }));

        expect(getAllSpy).not.toHaveBeenCalled();
        expect(selector.currentId).toBe(optionA.id);
    });
});
