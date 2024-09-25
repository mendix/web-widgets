import { ListWidgetValue, ObjectItem } from "mendix";

export function listWidget(get: (item: ObjectItem) => React.ReactNode): ListWidgetValue {
    return { get } as unknown as ListWidgetValue;
}
