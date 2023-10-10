import { ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { ReactNode } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";

export class WidgetItem implements GalleryItemHelper {
    private _classValue: ListExpressionValue<string>;
    private _contentValue: ListWidgetValue;

    constructor(classValue: ListExpressionValue<string>, contentValue: ListWidgetValue) {
        this._classValue = classValue;
        this._contentValue = contentValue;
    }

    itemClass(item: ObjectItem): string | undefined {
        return this._classValue.get(item).value;
    }

    render(item: ObjectItem): ReactNode {
        return this._contentValue.get(item);
    }
}
