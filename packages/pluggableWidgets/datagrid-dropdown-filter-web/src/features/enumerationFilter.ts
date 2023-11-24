import {
    DispatchFilterUpdate,
    FilterContextValue,
    FilterType,
    error,
    value,
    Result
} from "@mendix/widget-plugin-filtering";
import { ListAttributeValue, ValueStatus } from "mendix";
import { FilterCondition } from "mendix/filters";
import { attribute, equals, literal, or } from "mendix/filters/builders";
import { DatagridDropdownFilterContainerProps, FilterOptionsType } from "../../typings/DatagridDropdownFilterProps";
import { FilterComponentProps } from "../components/FilterComponent";
import { attributeNotFound, invalidOptionValue, requiredAttributesNotFound } from "./configurationErrors";
import { AttributeTypeError, ConfigurationError } from "./errors";
import { Option } from "../utils/types";

type EnumFilterError = ConfigurationError | AttributeTypeError;

type AttrsArray = ListAttributeValue[];

type ContextReadResult = Result<AttrsArray, EnumFilterError>;

function isEnumType(type: string): boolean {
    return /Enum|Boolean/.test(type);
}

function findAttributesByType(multipleAttributes?: { [key: string]: ListAttributeValue }): AttrsArray | undefined {
    if (!multipleAttributes) {
        return undefined;
    }
    return Object.keys(multipleAttributes)
        .map(key => multipleAttributes[key])
        .filter(attr => isEnumType(attr.type));
}

function attributeToOptions(attribute: ListAttributeValue): Option[] {
    if (!attribute.universe) {
        return [];
    }
    return attribute.universe.map(value => ({
        caption: attribute.formatter.format(value) ?? "",
        value: value?.toString() ?? ""
    }));
}

function universeValue(type: ListAttributeValue["type"], value: string): boolean | string {
    if (type === "Boolean") {
        if (value !== "true" && value !== "false") {
            return value;
        }
        return value === "true";
    }
    return value;
}

function isNotAllowedValue(attr: ListAttributeValue, value: string): boolean {
    const universe = attr.universe ?? [];
    return !universe.includes(universeValue(attr.type, value));
}

function validateCustomOptions(attributes: ListAttributeValue[], options: Option[]): ConfigurationError | undefined {
    const invalidOption = options.find(option => attributes.every(attr => isNotAllowedValue(attr, option.value)));

    if (invalidOption) {
        return invalidOptionValue(invalidOption.caption);
    }
}

function getFilterCondition(
    listAttribute: ListAttributeValue | undefined,
    values: Option[]
): FilterCondition | undefined {
    if (!listAttribute || !listAttribute.filterable || values.length === 0) {
        return undefined;
    }

    const { id, type } = listAttribute;
    const filterAttribute = attribute(id);

    const filters = values
        .filter(filterOption => listAttribute.universe?.includes(universeValue(listAttribute.type, filterOption.value)))
        .map(filter => equals(filterAttribute, literal(universeValue(type, filter.value))));

    if (filters.length > 1) {
        return or(...filters);
    }

    const [filterValue] = filters;
    return filterValue;
}

function getSingleAttr(context: FilterContextValue): ContextReadResult {
    const { singleAttribute } = context;

    if (singleAttribute === undefined) {
        return error(attributeNotFound());
    }

    if (!isEnumType(singleAttribute.type)) {
        return error(new AttributeTypeError());
    }

    return value([singleAttribute]);
}

function getMultiAttr(context: FilterContextValue): ContextReadResult {
    const { multipleAttributes } = context;
    const attributes = findAttributesByType(multipleAttributes) ?? [];

    if (attributes.length === 0) {
        return error(requiredAttributesNotFound());
    }

    return value(attributes);
}

export function getEnumAttributes(context: FilterContextValue): ContextReadResult {
    const isMultiAttrMode = !!context.multipleAttributes;

    if (isMultiAttrMode) {
        return getMultiAttr(context);
    }

    return getSingleAttr(context);
}

export function getDefaultValue(
    context: FilterContextValue,
    attributes: AttrsArray,
    defaultValueFromWidgetProps?: string
): string | undefined {
    const { singleInitialFilter, multipleInitialFilters } = context;

    const savedValue = singleInitialFilter
        ? singleInitialFilter?.map(filter => filter.value).join(",")
        : attributes
              ?.flatMap(attribute => multipleInitialFilters?.[attribute.id].map(filter => filter.value))
              .join(",");

    return savedValue ? savedValue : defaultValueFromWidgetProps;
}

type GetOptionsParams = {
    autoOptions: boolean;
    attributes: AttrsArray;
    customOptions: FilterOptionsType[];
};

export function getOptions(params: GetOptionsParams): Result<Option[], EnumFilterError> {
    const { autoOptions, attributes, customOptions } = params;

    if (autoOptions) {
        return value(attributes.flatMap(attributeToOptions));
    }

    const isAllOptionsReady = customOptions.every(
        ({ value, caption }) => value.status === ValueStatus.Available && caption.status === ValueStatus.Available
    );

    const options = isAllOptionsReady
        ? customOptions.map(value => ({
              caption: value.caption.value ?? "",
              value: value.value.value ?? ""
          }))
        : [];

    const err = validateCustomOptions(attributes, options);

    return err ? error(err) : value(options);
}

export function getOnChange(
    dispatch: DispatchFilterUpdate,
    attributes: AttrsArray,
    widgetProps: DatagridDropdownFilterContainerProps
): (values: Option[]) => void {
    return (values: Option[]): void => {
        const valuesString = values.map(v => v.value).join(",");
        const attributeCurrentValue = widgetProps.valueAttribute?.value || "";
        if (valuesString !== attributeCurrentValue) {
            widgetProps.valueAttribute?.setValue(valuesString);
            widgetProps.onChange?.execute();
        }
        const conditions = attributes
            ?.map(attribute => getFilterCondition(attribute, values))
            .filter((filter): filter is FilterCondition => filter !== undefined);
        dispatch({
            getFilterCondition: () => (conditions && conditions.length > 1 ? or(...conditions) : conditions?.[0]),
            filterType: FilterType.ENUMERATION
        });
    };
}

type FilterProps = Result<FilterComponentProps, EnumFilterError>;
export function getFilterProps(
    context: FilterContextValue,
    widgetProps: DatagridDropdownFilterContainerProps
): FilterProps {
    const {
        auto,
        filterOptions,
        ariaLabel,
        style,
        tabIndex,
        multiSelect,
        emptyOptionCaption,
        class: classProp,
        defaultValue: defaultValueProp
    } = widgetProps;
    const attributes = getEnumAttributes(context);

    if (attributes.hasError) {
        return error(attributes.error);
    }

    const options = getOptions({
        autoOptions: auto,
        customOptions: filterOptions,
        attributes: attributes.value
    });

    if (options.hasError) {
        return error(options.error);
    }

    const defaultValue = getDefaultValue(context, attributes.value, defaultValueProp?.value);

    const onChange = getOnChange(context.filterDispatcher, attributes.value, widgetProps);

    return value({
        updateFilters: onChange,
        options: options.value,
        initialSelected: defaultValue,
        ariaLabel: ariaLabel?.value,
        className: classProp,
        emptyOptionCaption: emptyOptionCaption?.value,
        multiSelect,
        styles: style,
        tabIndex
    });
}
