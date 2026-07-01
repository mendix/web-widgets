import { ValueStatus } from "mendix";
import { ImageContainerProps } from "../../typings/ImageProps";
import { ImageType } from "../components/Image/Image";

export type GetImagePropsInput = Pick<
    ImageContainerProps,
    "datasource" | "imageIcon" | "imageObject" | "imageUrl" | "defaultImageDynamic"
>;

const fallback: ImageType = { type: "image", image: undefined };

export function getImageProps({
    datasource,
    imageIcon,
    imageObject,
    imageUrl,
    defaultImageDynamic: defaultImage
}: GetImagePropsInput): ImageType {
    switch (datasource) {
        case "image": {
            // if main image is available or loading
            if (imageObject?.status === ValueStatus.Available || imageObject?.status === ValueStatus.Loading) {
                return {
                    type: "image",
                    image: imageObject?.value?.uri
                };
            }

            // if main image is not available, but fallback is available or loading
            if (defaultImage?.status === ValueStatus.Available || defaultImage?.status === ValueStatus.Loading) {
                return {
                    type: "image",
                    image: defaultImage?.value?.uri
                };
            }

            // if main image and fallback are not available
            return { type: "image", image: undefined };
        }
        case "imageUrl":
            return {
                type: "image",
                image: imageUrl?.status === ValueStatus.Available ? imageUrl.value : undefined
            };
        case "icon": {
            if (imageIcon?.status === ValueStatus.Available && imageIcon.value) {
                const icon = imageIcon.value;
                return {
                    type: icon.type,
                    image: icon.type === "image" ? icon.iconUrl : icon.iconClass
                };
            }
            return fallback;
        }
        default:
            return fallback;
    }
}
