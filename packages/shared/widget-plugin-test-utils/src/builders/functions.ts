import { ReactNode } from "react";
import type { Big } from "big.js";
import type {
    ListValue,
    ListExpressionValue,
    ListWidgetValue,
    ObjectItem,
    EditableValue,
    ListAttributeValue,
    ListActionValue,
    ActionValue,
    ReferenceValue,
    ReferenceSetValue,
    DynamicValue
} from "mendix";
import { ListValueBuilder } from "./ListValueBuilder.js";
import { ListAttributeValueBuilder } from "./ListAttributeValueBuilder.js";
import { EditableValueBuilder } from "./EditableValueBuilder.js";
import { ReferenceValueBuilder } from "./ReferenceValueBuilder.js";
import { ReferenceSetValueBuilder } from "./ReferenceSetValueBuilder.js";
import { Status } from "../constants.js";

/** @deprecated Please, uee {@link listExp} instead */
export function buildListExpression<T extends string | boolean | Date | Big>(value: T): ListExpressionValue<T> {
    return { get: () => dynamicValue<T>(value) } as Pick<ListExpressionValue, "get"> as ListExpressionValue<T>;
}

/** @deprecated Please, use {@link listWidget} instead */
export function buildWidgetValue(value: ReactNode): ListWidgetValue {
    return { get: () => value } as Pick<ListWidgetValue, "get"> as ListWidgetValue;
}

export function obj(id = Math.random().toFixed(16).slice(2, 6)): ObjectItem {
    id = `obj_${id}`;
    return { id } as unknown as ObjectItem;
}

export function objectItems(length = 1): ObjectItem[] {
    length = Math.floor(length);
    return length > 0 ? Array.from({ length }, obj) : [];
}

export function list(n: number): ListValue {
    return ListValueBuilder().withItems(objectItems(n));
}

export function listAttr<T extends string | boolean | Date | Big>(get: (item: ObjectItem) => T): ListAttributeValue<T> {
    const attr = new ListAttributeValueBuilder<T>().build();
    const attrGet = jest.fn((item: ObjectItem) =>
        new EditableValueBuilder().withValue(get(item)).build()
    ) as unknown as (item: ObjectItem) => EditableValue<T>;
    attr.get = attrGet;
    return attr;
}

export function attrId(id: string = "{unset}"): ListAttributeValue["id"] {
    return id as ListAttributeValue["id"];
}

export function listExp<T extends string | boolean | Date | Big>(get: (item: ObjectItem) => T): ListExpressionValue<T> {
    return { get: (item: ObjectItem) => dynamicValue<T>(get(item)) } as unknown as ListExpressionValue<T>;
}

export function listWidget(get: (item: ObjectItem) => ReactNode): ListWidgetValue {
    return { get } as unknown as ListWidgetValue;
}

export function listAction(customValue?: (actionFactory: typeof actionValue) => ActionValue): ListActionValue {
    return {
        get: () => (typeof customValue === "function" ? customValue(actionValue) : actionValue())
    } as unknown as ListActionValue;
}

/**
 * Short function to mock ReferenceValue.
 * @param factory - optional factory function which takes
 * ReferenceValueBuilder as first argument and returns new ReferenceValue.
 */
export function ref(factory?: (builder: ReferenceValueBuilder) => ReferenceValue): ReferenceValue {
    factory ??= builder => builder.build();
    return factory(new ReferenceValueBuilder());
}

/**
 * Short function to mock ReferenceSetValue.
 * @param factory - optional factory function which takes
 * ReferenceSetValueBuilder as first argument and returns new ReferenceValue.
 */
export function refSet(factory?: (builder: ReferenceSetValueBuilder) => ReferenceSetValue): ReferenceSetValue {
    factory ??= builder => builder.build();
    return factory(new ReferenceSetValueBuilder());
}

export function dynamicValue<T>(value?: T, loading?: boolean): DynamicValue<T> {
    if (loading) {
        return { status: Status.Loading, value };
    }
    return value !== undefined ? { status: Status.Available, value } : { status: Status.Unavailable, value: undefined };
}

export function actionValue(canExecute = true, isExecuting = false): ActionValue {
    return { canExecute, isExecuting, execute: jest.fn() };
}
