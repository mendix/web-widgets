import { ObjectItem } from "mendix";
import { ReactNode } from "react";

export interface GalleryItemHelper {
    hasOnClick(item: ObjectItem): boolean;
    itemClass(item: ObjectItem): string | undefined;
    render(item: ObjectItem): ReactNode;
}
