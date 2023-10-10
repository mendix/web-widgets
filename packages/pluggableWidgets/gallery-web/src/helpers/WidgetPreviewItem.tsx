import { ObjectItem } from "mendix";
import { ReactNode, createElement, useMemo } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { GalleryPreviewProps } from "../../typings/GalleryProps";

type ContentValue = GalleryPreviewProps["content"];

export class WidgetPreviewItem implements GalleryItemHelper {
    private _contentValue: ContentValue;
    private _dropZoneCaption: string;
    private _clickable: boolean;

    constructor(contentValue: ContentValue, dropZoneCaption: string, clickable: boolean) {
        this._contentValue = contentValue;
        this._dropZoneCaption = dropZoneCaption;
        this._clickable = clickable;
    }

    itemClass(_: ObjectItem): string | undefined {
        return undefined;
    }

    render(_: ObjectItem): ReactNode {
        const { renderer: Renderer } = this._contentValue;

        return (
            <Renderer caption={this._dropZoneCaption}>
                <div />
            </Renderer>
        );
    }

    clickable(_: ObjectItem): boolean {
        return this._clickable;
    }
}

export function useWidgetPreviewItem(params: { contentValue: ContentValue; clickable: boolean }): WidgetPreviewItem {
    return useMemo(
        () => new WidgetPreviewItem(params.contentValue, "Empty list message: Place widgets here", params.clickable),
        [params.contentValue, params.clickable]
    );
}
