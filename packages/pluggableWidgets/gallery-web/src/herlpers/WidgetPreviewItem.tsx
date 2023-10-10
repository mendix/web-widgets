import { ObjectItem } from "mendix";
import { ReactNode, createElement } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { GalleryPreviewProps } from "../../typings/GalleryProps";

type ContentValue = GalleryPreviewProps["content"];

export class WidgetPreviewItem implements GalleryItemHelper {
    private _contentValue: ContentValue;
    private _dropZoneCaption: string;

    constructor(contentValue: ContentValue, dropZoneCaption: string) {
        this._contentValue = contentValue;
        this._dropZoneCaption = dropZoneCaption;
    }

    itemClass(_item: ObjectItem): string | undefined {
        return undefined;
    }

    render(_item: ObjectItem): ReactNode {
        const { renderer: Renderer } = this._contentValue;

        return (
            <Renderer caption={this._dropZoneCaption}>
                <div />
            </Renderer>
        );
    }
}
