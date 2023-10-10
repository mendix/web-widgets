import { ObjectItem } from "mendix";
import { ReactNode } from "react";

export interface GalleryItemHelper {
    itemClass(item: ObjectItem): string | undefined;
    render(item: ObjectItem): ReactNode;
}
