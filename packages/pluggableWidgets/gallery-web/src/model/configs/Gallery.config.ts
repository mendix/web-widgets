import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { GalleryContainerProps } from "../../../typings/GalleryProps";

export interface GalleryConfig {
    id: string;
    name: string;
}

export function galleryConfig(props: GalleryContainerProps): GalleryConfig {
    const id = `${props.name}:Gallery@${generateUUID()}`;

    return {
        id,
        name: props.name
    };
}
