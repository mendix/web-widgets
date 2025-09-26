import { ListWidgetValue, ObjectItem } from "mendix";
import { ReactNode } from "react";

/**
 * Returns `ListWidgetValue` mock.
 * @param get - function to use as `.get`. Should map item to React node.
 */
export function listWidget(get: (item: ObjectItem) => ReactNode): ListWidgetValue {
    return { get } as ListWidgetValue;
}
