import { ObjectItem } from "mendix";
import { ReactNode, createElement, useMemo } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { GalleryPreviewProps } from "../../typings/GalleryProps";
import { ListItemButton } from "../components/ListItemButton";

type ContentValue = GalleryPreviewProps["content"];

export class ItemPreviewHelper implements GalleryItemHelper {
    private _contentValue: ContentValue;
    private _dropZoneCaption: string;
    private _hasOnClick: boolean;

    constructor(contentValue: ContentValue, dropZoneCaption: string, hasOnClick: boolean) {
        this._contentValue = contentValue;
        this._dropZoneCaption = dropZoneCaption;
        this._hasOnClick = hasOnClick;
    }

    itemClass(_: ObjectItem): string | undefined {
        return undefined;
    }

    render(_: ObjectItem): ReactNode {
        const { renderer: Renderer } = this._contentValue;

        const content = (
            <Renderer caption={this._dropZoneCaption}>
                <div />
            </Renderer>
        );

        if (this._hasOnClick) {
            return <ListItemButton>{content}</ListItemButton>;
        }

        return content;
    }

    hasOnClick(_: ObjectItem): boolean {
        return this._hasOnClick;
    }
}

export function useItemPreviewHelper(params: { contentValue: ContentValue; hasOnClick: boolean }): ItemPreviewHelper {
    return useMemo(
        () => new ItemPreviewHelper(params.contentValue, "Gallery item: Place widgets here", params.hasOnClick),
        [params.contentValue, params.hasOnClick]
    );
}
