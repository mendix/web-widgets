import { ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { ReactNode, useMemo } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";

type ClassValue = ListExpressionValue<string> | undefined;
type ContentValue = ListWidgetValue | undefined;

export class WidgetItem implements GalleryItemHelper {
    private _classValue: ClassValue;
    private _contentValue: ContentValue;

    constructor(classValue: ClassValue, contentValue: ContentValue) {
        this._classValue = classValue;
        this._contentValue = contentValue;
    }

    itemClass(item: ObjectItem): string | undefined {
        return this._classValue?.get(item).value;
    }

    render(item: ObjectItem): ReactNode {
        return this._contentValue?.get(item);
    }
}

export function useWidgetItem(params: { classValue: ClassValue; contentValue: ContentValue }): WidgetItem {
    return useMemo(
        () => new WidgetItem(params.classValue, params.contentValue),
        [params.classValue, params.contentValue]
    );
}
