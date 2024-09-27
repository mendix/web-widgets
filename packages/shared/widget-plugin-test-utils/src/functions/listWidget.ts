import { ListWidgetValue, ObjectItem } from "mendix";

/**
 * Returns `ListWidgetValue` mock.
 * @param get - function to use as `.get`. Should map item to React node.
 */
export function listWidget(get: (item: ObjectItem) => React.ReactNode): ListWidgetValue {
    return { get } as ListWidgetValue;
}
