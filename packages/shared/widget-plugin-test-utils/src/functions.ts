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
    ActionValue
} from "mendix";
import { dynamicValue, actionValue } from "./builders/DynamicActionValueBuilder.js";
import { ListValueBuilder } from "./builders/ListValueBuilder.js";
import { ListAttributeValueBuilder } from "./builders/ListAttributeValueBuilder.js";
import { EditableValueBuilder } from "./builders/EditableValueBuilder.js";

/** @deprecated Please, uee {@link listExp} instead */
export function buildListExpression<T extends string | boolean | Date | Big>(value: T): ListExpressionValue<T> {
    return { get: () => dynamicValue<T>(value) } as Pick<ListExpressionValue, "get"> as ListExpressionValue<T>;
}

/** @deprecated Please, use {@link listWidget} instead */
export function buildWidgetValue(value: ReactNode): ListWidgetValue {
    return { get: () => value } as Pick<ListWidgetValue, "get"> as ListWidgetValue;
}

export function objectItems(length = 1): ObjectItem[] {
    length = Math.floor(length);
    if (length > 0) {
        return Array.from({ length }, () => ({ id: Math.random().toFixed(16).slice(2) } as ObjectItem));
    }

    return [];
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
