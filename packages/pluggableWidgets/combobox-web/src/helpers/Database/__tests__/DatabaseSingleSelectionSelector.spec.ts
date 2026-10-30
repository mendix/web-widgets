import { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import {
    attrId,
    dynamic,
    EditableValueBuilder,
    list,
    listAttribute,
    obj,
    SelectionSingleValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../../../typings/ComboboxProps";
import { DatabaseSingleSelectionSelector } from "../DatabaseSingleSelectionSelector";

type PropsOverrides = {
    items: ObjectItem[];
    values: Map<string, string>;
    targetValue?: string;
    validation?: string;
    selection?: ReturnType<SelectionSingleValueBuilder["build"]>;
    ds?: ListValue;
};

function buildProps({ items, values, targetValue, validation, selection, ds }: PropsOverrides): ComboboxContainerProps {
    const valueAttr = listAttribute<string>(item => values.get(item.id) ?? "", attrId("value")) as ListAttributeValue<
        string | Big
    >;
    const captionAttr = listAttribute<string>(item => `caption_${item.id}`, attrId("caption"));

    const targetAttr = new EditableValueBuilder<string>().withValue(targetValue).withValidation(validation).build();

    return {
        name: "comboBox",
        id: "comboBox1",
        source: "database",
        optionsSourceType: "association",
        optionsSourceDatabaseDataSource: ds ?? list(items),
        optionsSourceDatabaseItemSelection: selection ?? new SelectionSingleValueBuilder().build(),
        optionsSourceDatabaseCaptionType: "attribute",
        optionsSourceDatabaseCaptionAttribute: captionAttr,
        optionsSourceDatabaseValueAttribute: valueAttr,
        databaseAttributeString: targetAttr as any,
        emptyOptionText: dynamic.available("Select..."),
        optionsSourceDatabaseCustomContentType: "no",
        optionsSourceAssociationCustomContentType: "no",
        staticDataSourceCustomContentType: "no",
        optionsSourceAssociationCaptionType: "attribute",
        clearable: true,
        filterType: "contains",
        lazyLoading: false,
        loadingType: "spinner",
        customEditability: "default",
        customEditabilityExpression: dynamic.available(false),
        filterInputDebounceInterval: 200,
        selectedItemsStyle: "text",
        readOnlyStyle: "bordered",
        selectionMethod: "checkbox",
        selectAllButton: false,
        selectAllButtonCaption: dynamic.available("Select All"),
        ariaRequired: dynamic.available(true),
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

describe("DatabaseSingleSelectionSelector — writing and read-only", () => {
    const optionA = obj("A");
    const optionB = obj("B");
    const items = [optionA, optionB];
    const values = new Map<string, string>([
        [optionA.id, "v1"],
        [optionB.id, "v2"]
    ]);

    it("writes the value attribute and the selection", () => {
        const selection = new SelectionSingleValueBuilder().build();
        const setSelection = jest.spyOn(selection, "setSelection");
        const props = buildProps({ items, values, selection });
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });
        selector.updateProps(props);

        selector.setValue(optionA.id);

        expect(props.databaseAttributeString!.setValue).toHaveBeenLastCalledWith("v1");
        expect(setSelection).toHaveBeenLastCalledWith(optionA);
        expect(selector.currentId).toBe(optionA.id);
    });

    it("clears the value attribute and the selection", () => {
        const selection = new SelectionSingleValueBuilder().withSelected(optionA).build();
        const setSelection = jest.spyOn(selection, "setSelection");
        const props = buildProps({ items, values, targetValue: "v1", selection });
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });
        selector.updateProps(props);
        expect(selector.currentId).toBe(optionA.id);

        selector.setValue(null);

        expect(props.databaseAttributeString!.setValue).toHaveBeenLastCalledWith(undefined);
        expect(setSelection).toHaveBeenLastCalledWith(undefined);
        expect(selector.currentId).toBeNull();
    });

    it("ignores updates while a non-lazy datasource is loading", () => {
        const props = buildProps({ items, values, targetValue: "v1", ds: list.loading() });
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });

        selector.updateProps(props);

        expect(selector.status).toBe("unavailable");
        expect(selector.currentId).toBeNull();
    });

    it("is read-only and loads no options when custom editability is 'never'", () => {
        const props = { ...buildProps({ items, values, targetValue: "v1" }), customEditability: "never" as const };
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });

        selector.updateProps(props);

        expect(selector.readOnly).toBe(true);
        expect(props.optionsSourceDatabaseDataSource!.setLimit).toHaveBeenCalledWith(0);
    });

    it("resolves captions and passes validation and clearable through", () => {
        const props = buildProps({ items, values, targetValue: "v1", validation: "Required" });
        const selector = new DatabaseSingleSelectionSelector({ filterInputDebounceInterval: 200 });

        selector.updateProps(props);

        expect(selector.caption.get(optionA.id)).toBe(`caption_${optionA.id}`);
        expect(selector.caption.get(null)).toBe("Formatted v1");
        expect(selector.validation).toBe("Required");
        expect(selector.clearable).toBe(true);
    });
});
