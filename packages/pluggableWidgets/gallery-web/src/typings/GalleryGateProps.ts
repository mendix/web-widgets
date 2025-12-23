import { GalleryContainerProps } from "../../typings/GalleryProps";

/** Type to declare props available through main gate. */
export type GalleryGateProps = Pick<GalleryContainerProps, "name" | "style" | "class" | "datasource">;
