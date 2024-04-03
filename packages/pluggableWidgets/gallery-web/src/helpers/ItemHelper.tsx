import { ListExpressionValue, ListWidgetValue, ListActionValue, ObjectItem } from "mendix";
import { ReactNode, useMemo, createElement } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { ListItemButton } from "../components/ListItemButton";

type ClassValue = ListExpressionValue<string> | undefined;
type ContentValue = ListWidgetValue | undefined;
type ClickValue = ListActionValue | undefined;

export class ItemHelper implements GalleryItemHelper {
    private _classValue: ClassValue;
    private _contentValue: ContentValue;
    private _clickValue: ClickValue;

    constructor(classValue: ClassValue, contentValue: ContentValue, clickValue: ClickValue) {
        this._classValue = classValue;
        this._contentValue = contentValue;
        this._clickValue = clickValue;
    }

    itemClass(item: ObjectItem): string | undefined {
        return this._classValue?.get(item).value;
    }

    render(item: ObjectItem): ReactNode {
        if (this.hasOnClick(item)) {
            return <ListItemButton>{this._contentValue?.get(item)}</ListItemButton>;
        }

        return this._contentValue?.get(item);
    }

    hasOnClick(item: ObjectItem): boolean {
        return !!this._clickValue?.get(item);
    }
}

export function useItemHelper(params: {
    classValue: ClassValue;
    contentValue: ContentValue;
    clickValue: ClickValue;
}): ItemHelper {
    return useMemo(
        () => new ItemHelper(params.classValue, params.contentValue, params.clickValue),
        [params.classValue, params.contentValue, params.clickValue]
    );
}
