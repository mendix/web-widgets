import {
    String_InputFilterInterface,
    Number_InputFilterInterface,
    Date_InputFilterInterface
} from "../../typings/filters/InputFilterInterface";
import { action, computed, makeObservable, observable } from "mobx";
import { FilterCondition } from "mendix/filters";
import { ListAttributeValue } from "mendix";
import {
    attribute,
    literal,
    equals,
    or,
    and,
    contains,
    startsWith,
    endsWith,
    greaterThan,
    greaterThanOrEqual,
    notEqual,
    lessThan,
    lessThanOrEqual
} from "mendix/filters/builders";
import { Big } from "big.js";
import { Argument, DateArgument, NumberArgument, StringArgument } from "./Argument";
import {
    AllFunctions,
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue,
    FilterFunctionString
} from "../../typings/filters/FilterFunctions";

class BaseInputFilterSlot<V extends Argument, F extends AllFunctions, S extends string | Big | Date> {
    filterFunction: F;
    arg1: V;
    arg2: V;
    private _attributes: ListAttributeValue[] = [];
    private readonly initialFn: F;

    constructor(arg1: V, arg2: V, initialFn: F, attributes: ListAttributeValue[]) {
        this.initialFn = initialFn;
        this.filterFunction = initialFn;
        this._attributes = attributes;

        this.arg1 = arg1;
        this.arg2 = arg2;

        makeObservable<this, "_attributes">(this, {
            filterFunction: observable,
            _attributes: observable,

            filterCondition: computed,

            updateProps: action
        });
    }

    updateProps(attributes: ListAttributeValue[]) {
        this._attributes = attributes;
        // todo: fixme
        this.arg2.updateProps(this._attributes[0].formatter as any);
    }

    get filterCondition(): FilterCondition {
        const conditions = this._attributes
            .map(attr => getFilterCondition(attr, this.arg1.value, this.arg2.value, this.filterFunction))
            .filter((filter): filter is FilterCondition => filter !== undefined);

        return conditions?.length > 1 ? or(...conditions) : conditions?.[0];
    }

    get state(): [S, S, F] {
        return [this.arg1.value as S, this.arg2.value as S, this.filterFunction];
    }

    setState(s: [S, S, F]) {
        this.arg1.value = s[0];
        this.arg2.value = s[1];
        this.filterFunction = s[2];
    }

    reset() {
        // todo: reset filter to default value?
        this.arg1.value = undefined;
        this.arg2.value = undefined;
        this.filterFunction = this.initialFn;
    }
}

function getFilterCondition<T extends string | Big | Date>(
    listAttribute: ListAttributeValue,
    value: T | undefined,
    valueR: T | undefined,
    operation: AllFunctions
): FilterCondition | undefined {
    if (
        !listAttribute ||
        !listAttribute.filterable ||
        (operation !== "empty" && operation !== "notEmpty" && !value) ||
        (operation === "between" && (!value || !valueR))
    ) {
        return undefined;
    }

    if (operation === "between") {
        return and(
            greaterThan(attribute(listAttribute.id), literal(value)),
            lessThan(attribute(listAttribute.id), literal(valueR))
        );
    }

    const filters = {
        contains,
        startsWith,
        endsWith,
        greater: greaterThan,
        greaterEqual: greaterThanOrEqual,
        equal: equals,
        notEqual,
        smaller: lessThan,
        smallerEqual: lessThanOrEqual,
        empty: equals,
        notEmpty: notEqual
    };

    return filters[operation](
        attribute(listAttribute.id),
        literal(operation === "empty" || operation === "notEmpty" ? undefined : value)
    );
}

export class StringInputFilterSlot
    extends BaseInputFilterSlot<
        StringArgument,
        FilterFunctionString | FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        string
    >
    implements String_InputFilterInterface
{
    valueType: "string" = "string";

    constructor(attributes: ListAttributeValue<string>[]) {
        const { formatter } = attributes[0];
        super(new StringArgument(formatter), new StringArgument(formatter), "equal", attributes);
        // todo restore operation and value from config
    }
}

export class NumberInputFilterSlot
    extends BaseInputFilterSlot<
        NumberArgument,
        FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        Big
    >
    implements Number_InputFilterInterface
{
    valueType: "number" = "number";

    constructor(attributes: ListAttributeValue<Big>[]) {
        const { formatter } = attributes[0];
        super(new NumberArgument(formatter), new NumberArgument(formatter), "equal", attributes);
        // todo restore operation and value from config
    }
}

export class DateInputFilterSlot
    extends BaseInputFilterSlot<
        DateArgument,
        FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        Date
    >
    implements Date_InputFilterInterface
{
    valueType: "date" = "date";

    constructor(attributes: ListAttributeValue<Date>[]) {
        const { formatter } = attributes[0];
        super(new DateArgument(formatter), new DateArgument(formatter), "equal", attributes);
        // todo restore operation and value from config
    }
}

export type InputFilterSlot = StringInputFilterSlot | NumberInputFilterSlot | DateInputFilterSlot;

export function createFilterSlot(attribute: ListAttributeValue): InputFilterSlot | undefined {
    /**
     * <attributeType name="String" />
     *                                     <attributeType name="AutoNumber" />
     *                                     <attributeType name="Boolean" />
     *                                     <attributeType name="DateTime" />
     *                                     <attributeType name="Decimal" />
     *                                     <attributeType name="Enum" />
     *                                     <attributeType name="Integer" />
     *                                     <attributeType name="Long" />
     */
    switch (attribute.type) {
        case "DateTime":
            return new DateInputFilterSlot([attribute] as ListAttributeValue<Date>[]);

        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return new NumberInputFilterSlot([attribute] as ListAttributeValue<Big>[]);

        case "String":
            return new StringInputFilterSlot([attribute] as ListAttributeValue<string>[]);

        case "Boolean":
        case "Enum":
        default:
            console.error("Not supported type " + attribute.type, attribute);
            return undefined;
    }
}
