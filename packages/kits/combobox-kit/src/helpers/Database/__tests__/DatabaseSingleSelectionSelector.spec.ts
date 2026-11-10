import { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import {
    attrId,
    dynamic,
    EditableValueBuilder,
    list,
    listAttribute,
    ListValueBuilder,
    obj,
    SelectionSingleValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { createSelector as createHarness, SelectorHarness } from "../../__tests__/harness";
import { DatabaseSingleSelectionSelector } from "../DatabaseSingleSelectionSelector";

function createSelector(props: ComboboxContainerProps): SelectorHarness<DatabaseSingleSelectionSelector> {
    return createHarness<DatabaseSingleSelectionSelector>(props);
}

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

describe("DatabaseSingleSelectionSelector — external target-attribute changes", () => {
    const optionA = obj("A");
    const optionB = obj("B");
    const items = [optionA, optionB];
    const values = new Map<string, string>([
        [optionA.id, "v1"],
        [optionB.id, "v2"]
    ]);

    it("resolves currentId from targetAttribute.value on the first props", () => {
        const { selector } = createSelector(buildProps({ items, values, targetValue: "v1" }));

        expect(selector.currentId).toBe(optionA.id);
    });

    it("refreshes currentId when targetAttribute.value changes externally after a selection exists", () => {
        // WC-3355: without this behavior, an external value change (e.g. from a microflow)
        // leaves currentId pointing at the stale option.
        const selection = new SelectionSingleValueBuilder().build();
        const { selector, setProps } = createSelector(buildProps({ items, values, targetValue: "v1", selection }));
        expect(selector.currentId).toBe(optionA.id);

        setProps(buildProps({ items, values, targetValue: "v2", selection }));
        expect(selector.currentId).toBe(optionB.id);
    });

    it("falls back to loadSelectedValue when new value is not in loaded options", () => {
        const selection = new SelectionSingleValueBuilder().build();
        const soleItems = [optionA];
        const soleValues = new Map<string, string>([[optionA.id, "v1"]]);
        const { selector, setProps } = createSelector(
            buildProps({ items: soleItems, values: soleValues, targetValue: "v1", selection })
        );
        const loadSpy = jest.spyOn(selector.options, "loadSelectedValue");

        setProps(buildProps({ items: soleItems, values: soleValues, targetValue: "v-unknown", selection }));

        expect(loadSpy).toHaveBeenCalledWith("v-unknown", expect.anything());
    });

    it("clears currentId and selection when targetAttribute.value is cleared externally", () => {
        const selection = new SelectionSingleValueBuilder().build();
        const setSelectionSpy = jest.spyOn(selection, "setSelection");
        const { selector, setProps } = createSelector(buildProps({ items, values, targetValue: "v1", selection }));
        expect(selector.currentId).toBe(optionA.id);

        setProps(buildProps({ items, values, targetValue: undefined, selection }));

        expect(selector.currentId).toBeNull();
        expect(setSelectionSpy).toHaveBeenCalledWith(undefined);
    });

    it("keeps currentId and leaves the selection alone when targetAttribute.value is unchanged", () => {
        const selection = new SelectionSingleValueBuilder().build();
        const setSelectionSpy = jest.spyOn(selection, "setSelection");
        const { selector, setProps } = createSelector(buildProps({ items, values, targetValue: "v1", selection }));
        expect(setSelectionSpy).toHaveBeenCalledTimes(1);

        setProps(buildProps({ items, values, targetValue: "v1", selection }));

        expect(selector.currentId).toBe(optionA.id);
        expect(setSelectionSpy).toHaveBeenCalledTimes(1);
    });

    it("takes the datasource selection as the value when no target attribute is bound", () => {
        const selection = new SelectionSingleValueBuilder().withSelected(optionB).build();
        const props = { ...buildProps({ items, values, selection }), databaseAttributeString: undefined };

        const { selector } = createSelector(props);

        expect(selector.currentId).toBe(optionB.id);
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
        const { selector } = createSelector(props);

        selector.setValue(optionA.id);

        expect(props.databaseAttributeString!.setValue).toHaveBeenLastCalledWith("v1");
        expect(setSelection).toHaveBeenLastCalledWith(optionA);
        expect(selector.currentId).toBe(optionA.id);
    });

    it("clears the value attribute and the selection", () => {
        const selection = new SelectionSingleValueBuilder().withSelected(optionA).build();
        const setSelection = jest.spyOn(selection, "setSelection");
        const props = buildProps({ items, values, targetValue: "v1", selection });
        const { selector } = createSelector(props);
        expect(selector.currentId).toBe(optionA.id);

        selector.setValue(null);

        expect(props.databaseAttributeString!.setValue).toHaveBeenLastCalledWith(undefined);
        expect(setSelection).toHaveBeenLastCalledWith(undefined);
        expect(selector.currentId).toBeNull();
    });

    it("reports loading, with no value yet, while the datasource loads", () => {
        const props = buildProps({ items, values, targetValue: "v1", ds: list.loading() });
        const { selector } = createSelector(props);

        expect(selector.status).toBe("loading");
        expect(selector.currentId).toBeNull();
    });

    it("is read-only and loads no options when custom editability is 'never'", () => {
        const props = { ...buildProps({ items, values, targetValue: "v1" }), customEditability: "never" as const };
        const { selector } = createSelector(props);

        expect(selector.readOnly).toBe(true);
        expect(props.optionsSourceDatabaseDataSource!.setLimit).toHaveBeenCalledWith(0);
    });

    it("resolves captions and passes validation and clearable through", () => {
        const props = buildProps({ items, values, targetValue: "v1", validation: "Required" });
        const { selector } = createSelector(props);

        expect(selector.caption.get(optionA.id)).toBe(`caption_${optionA.id}`);
        expect(selector.caption.get(null)).toBe("Formatted v1");
        expect(selector.validation).toBe("Required");
        expect(selector.clearable).toBe(true);
    });
});

describe("DatabaseSingleSelectionSelector — lazy loading", () => {
    const optionA = obj("A");
    const values = new Map<string, string>([[optionA.id, "v1"]]);

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("drops the bound-value lookup and requests a full first page on load more", () => {
        // The lookup narrows the datasource to the bound value, which then reports no more items.
        const ds = list([]);
        const props = { ...buildProps({ items: [], values, targetValue: "v1", ds }), lazyLoading: true };
        const { selector } = createSelector(props);
        expect(ds.setLimit).toHaveBeenLastCalledWith(1);

        selector.options.loadMore();
        jest.runAllTimers();

        expect(ds.setFilter).toHaveBeenCalledTimes(1);
        expect(ds.setFilter).toHaveBeenCalledWith(undefined);
        expect(ds.setLimit).toHaveBeenLastCalledWith(100);
        expect(selector.options.isLoading).toBe(true);
    });

    it("pages as usual on load more when no lookup is active", () => {
        const ds = new ListValueBuilder().withItems([optionA]).withLimit(100).withHasMore(true).build();
        const props = { ...buildProps({ items: [optionA], values, targetValue: "v1", ds }), lazyLoading: true };
        const { selector } = createSelector(props);

        selector.options.loadMore();

        expect(ds.setFilter).not.toHaveBeenCalled();
        expect(ds.setLimit).toHaveBeenLastCalledWith(200);
    });
});
