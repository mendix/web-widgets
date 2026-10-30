import { Big } from "big.js";
import {
    ListAttributeValue,
    ListExpressionValue,
    ListValue,
    ObjectItem,
    ReferenceSetValue,
    ReferenceValue,
    SelectionMultiValue,
    SelectionSingleValue
} from "mendix";
import {
    dynamic,
    EditableValueBuilder,
    list,
    listAttribute,
    listExpression,
    ReferenceSetValueBuilder,
    ReferenceValueBuilder,
    SelectionMultiValueBuilder,
    SelectionSingleValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps, OptionsSourceStaticDataSourceType } from "../../../typings/ComboboxProps";

/**
 * Complete, valid ComboboxContainerProps. Every static prop has a value, so a test only
 * overrides what it is about. Static props never change between re-renders, so tests
 * build a new prop object per scenario, never mutate one between updateProps calls.
 */
export function baseProps(overrides: Partial<ComboboxContainerProps> = {}): ComboboxContainerProps {
    return {
        name: "comboBox",
        id: "comboBox1",
        tabIndex: 0,
        source: "context",
        optionsSourceType: "enumeration",
        attributeEnumeration: new EditableValueBuilder<string>().build(),
        attributeBoolean: new EditableValueBuilder<boolean>().build(),
        optionsSourceDatabaseDataSource: undefined,
        optionsSourceDatabaseItemSelection: undefined,
        optionsSourceAssociationCaptionType: "attribute",
        optionsSourceDatabaseCaptionType: "attribute",
        optionsSourceAssociationCaptionAttribute: undefined,
        optionsSourceDatabaseCaptionAttribute: undefined,
        optionsSourceAssociationCaptionExpression: undefined,
        optionsSourceDatabaseCaptionExpression: undefined,
        databaseAttributeString: undefined,
        optionsSourceDatabaseValueAttribute: undefined,
        attributeAssociation: new ReferenceValueBuilder().build(),
        optionsSourceAssociationDataSource: undefined,
        staticAttribute: new EditableValueBuilder<string | Big | boolean | Date>().build(),
        optionsSourceStaticDataSource: [],
        emptyOptionText: dynamic.available("Select..."),
        noOptionsText: dynamic.available("No options"),
        clearable: true,
        optionsSourceAssociationCustomContentType: "no",
        optionsSourceAssociationCustomContent: undefined,
        optionsSourceDatabaseCustomContentType: "no",
        optionsSourceDatabaseCustomContent: undefined,
        staticDataSourceCustomContentType: "no",
        showFooter: false,
        menuFooterContent: undefined,
        selectionMethod: "checkbox",
        selectedItemsStyle: "text",
        selectAllButton: false,
        selectAllButtonCaption: dynamic.available("Select all"),
        customEditability: "default",
        customEditabilityExpression: dynamic.available(true),
        readOnlyStyle: "bordered",
        onEnterEvent: undefined,
        onLeaveEvent: undefined,
        onChangeFilterInputEvent: undefined,
        ariaRequired: dynamic.available(false),
        ariaLabel: undefined,
        clearButtonAriaLabel: dynamic.available("Clear"),
        removeValueAriaLabel: dynamic.available("Remove"),
        a11ySelectedValue: dynamic.available("Selected value:"),
        a11yOptionsAvailable: dynamic.available("Options available:"),
        a11yInstructions: dynamic.available("Use arrows"),
        lazyLoading: false,
        loadingType: "spinner",
        selectedItemsSorting: "none",
        filterType: "contains",
        filterInputDebounceInterval: 200,
        ...overrides
    };
}

/** Items with deterministic ids and captions: obj_a → "Apple", obj_b → "Banana", ... */
export const captions: Record<string, string> = {
    obj_a: "Apple",
    obj_b: "Banana",
    obj_c: "Cherry",
    obj_d: "Date"
};

export function item(key: "a" | "b" | "c" | "d"): ObjectItem {
    return { id: `obj_${key}` } as ObjectItem;
}

export const itemA = item("a");
export const itemB = item("b");
export const itemC = item("c");
export const itemD = item("d");
export const allItems = [itemA, itemB, itemC, itemD];

export function captionAttribute(): ListAttributeValue<string> {
    const attr = listAttribute<string>(i => captions[i.id] ?? "");
    (attr as { id: string }).id = "captionAttr";
    return attr;
}

export function captionExpression(): ListExpressionValue<string> {
    return listExpression<string>(i => `expr:${captions[i.id] ?? ""}`);
}

export function datasource(items: ObjectItem[] = allItems): ListValue {
    return list(items);
}

interface AssociationOverrides extends Partial<ComboboxContainerProps> {
    attr?: ReferenceValue | ReferenceSetValue;
    ds?: ListValue;
    captionType?: "attribute" | "expression";
}

/** Context + association with a caption attribute (so lazy loading is possible). */
export function associationSingleProps(overrides: AssociationOverrides = {}): ComboboxContainerProps {
    const { attr, ds, captionType = "attribute", ...rest } = overrides;
    return baseProps({
        source: "context",
        optionsSourceType: "association",
        attributeAssociation: attr ?? new ReferenceValueBuilder().withValue(itemA).build(),
        optionsSourceAssociationDataSource: ds ?? datasource(),
        optionsSourceAssociationCaptionType: captionType,
        optionsSourceAssociationCaptionAttribute: captionAttribute(),
        optionsSourceAssociationCaptionExpression: captionExpression(),
        ...rest
    });
}

export function associationMultiProps(overrides: AssociationOverrides = {}): ComboboxContainerProps {
    const { attr, ...rest } = overrides;
    return associationSingleProps({
        attr: attr ?? new ReferenceSetValueBuilder().withValue([itemA]).build(),
        ...rest
    });
}

export function enumerationProps(
    attribute = new EditableValueBuilder<string>().withUniverse("red", "green", "blue").withValue("green").build(),
    overrides: Partial<ComboboxContainerProps> = {}
): ComboboxContainerProps {
    return baseProps({
        source: "context",
        optionsSourceType: "enumeration",
        attributeEnumeration: attribute,
        attributeBoolean: undefined as unknown as ComboboxContainerProps["attributeBoolean"],
        ...overrides
    });
}

export function booleanProps(
    attribute = new EditableValueBuilder<boolean>().withUniverse(true, false).withValue(true).build(),
    overrides: Partial<ComboboxContainerProps> = {}
): ComboboxContainerProps {
    return baseProps({
        source: "context",
        optionsSourceType: "boolean",
        attributeEnumeration: undefined as unknown as ComboboxContainerProps["attributeEnumeration"],
        attributeBoolean: attribute,
        ...overrides
    });
}

export function staticEntry(
    value: string | Big | boolean | Date,
    caption: string,
    customContent?: OptionsSourceStaticDataSourceType["staticDataSourceCustomContent"]
): OptionsSourceStaticDataSourceType {
    return {
        staticDataSourceValue: dynamic.available(value),
        staticDataSourceCaption: dynamic.available(caption),
        staticDataSourceCustomContent: customContent
    };
}

export const staticEntries = [staticEntry("one", "One"), staticEntry("two", "Two"), staticEntry("three", "Three")];

export function staticProps(
    attribute = new EditableValueBuilder<string | Big | boolean | Date>().build(),
    overrides: Partial<ComboboxContainerProps> = {}
): ComboboxContainerProps {
    return baseProps({
        source: "static",
        staticAttribute: attribute,
        optionsSourceStaticDataSource: staticEntries,
        ...overrides
    });
}

/** Value attribute: obj_a → "v_a", obj_b → "v_b", ... */
export function valueAttribute(): ListAttributeValue<string | Big> {
    const attr = listAttribute<string>(i => `v_${i.id.slice(-1)}`) as ListAttributeValue<string | Big>;
    (attr as { id: string }).id = "valueAttr";
    return attr;
}

interface DatabaseOverrides extends Partial<ComboboxContainerProps> {
    ds?: ListValue;
    selection?: SelectionSingleValue | SelectionMultiValue;
    captionType?: "attribute" | "expression";
}

export function databaseSingleProps(overrides: DatabaseOverrides = {}): ComboboxContainerProps {
    const { ds, selection, captionType = "attribute", ...rest } = overrides;
    return baseProps({
        source: "database",
        optionsSourceDatabaseDataSource: ds ?? datasource(),
        optionsSourceDatabaseItemSelection: selection ?? new SelectionSingleValueBuilder().build(),
        optionsSourceDatabaseCaptionType: captionType,
        optionsSourceDatabaseCaptionAttribute: captionAttribute(),
        optionsSourceDatabaseCaptionExpression: captionExpression(),
        optionsSourceDatabaseValueAttribute: valueAttribute(),
        databaseAttributeString:
            new EditableValueBuilder<string>().build() as ComboboxContainerProps["databaseAttributeString"],
        ...rest
    });
}

export function databaseMultiProps(overrides: DatabaseOverrides = {}): ComboboxContainerProps {
    const { selection, ...rest } = overrides;
    return databaseSingleProps({
        selection: selection ?? new SelectionMultiValueBuilder().withSelected([itemA]).build(),
        ...rest
    });
}
