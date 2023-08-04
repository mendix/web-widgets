import {
    DropZoneProps,
    RowLayoutProps,
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import {
    hidePropertiesIn,
    hidePropertyIn,
    moveProperty,
    Problem,
    Properties,
    transformGroupsIntoTabs
} from "@mendix/pluggable-widgets-tools";

import { DatasourceEnum, ImagePreviewProps } from "../typings/ImageProps";
import StructurePreviewImageSvg from "./assets/placeholder.svg";
import StructurePreviewImageSvgDark from "./assets/placeholder-dark.svg";

type ImageViewPreviewPropsKey = keyof ImagePreviewProps;

const dataSourceProperties: ImageViewPreviewPropsKey[] = ["imageObject", "imageUrl", "imageIcon"];

function filterDataSourceProperties(sourceProperty: DatasourceEnum): ImageViewPreviewPropsKey[] {
    switch (sourceProperty) {
        case "image":
            return dataSourceProperties.filter(prop => prop !== "imageObject");
        case "imageUrl":
            return dataSourceProperties.filter(prop => prop !== "imageUrl");
        case "icon":
            return dataSourceProperties.filter(prop => prop !== "imageIcon");
        default:
            return dataSourceProperties;
    }
}

function reorderTabsForStudio(tabs: Properties): void {
    const dimensionsTabIndex = tabs.findIndex(
        tab => tab.caption === "Dimensions" && tab.properties && tab.properties.length > 0
    );
    const dataSourceTabIndex = tabs.findIndex(
        tab => tab.caption === "Data source" && tab.properties && tab.properties.length > 0
    );
    if (dimensionsTabIndex >= 0 && dataSourceTabIndex >= 0) {
        moveProperty(dimensionsTabIndex, dataSourceTabIndex + 1, tabs);
    }
}

export function getProperties(
    values: ImagePreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    hidePropertiesIn(defaultProperties, values, filterDataSourceProperties(values.datasource));

    if (values.datasource === "image" && (!values.imageObject || values.imageObject?.type === "static")) {
        hidePropertyIn(defaultProperties, values, "defaultImageDynamic");
    }

    if (values.datasource === "icon") {
        hidePropertyIn(defaultProperties, values, "isBackgroundImage");
        hidePropertyIn(defaultProperties, values, "responsive");
    }

    if (values.isBackgroundImage) {
        hidePropertyIn(defaultProperties, values, "alternativeText");
    } else {
        hidePropertyIn(defaultProperties, values, "children");
    }

    if (values.datasource !== "image") {
        hidePropertyIn(defaultProperties, values, "defaultImageDynamic");
    }

    if (values.heightUnit === "auto") {
        hidePropertyIn(defaultProperties, values, "height");
    }

    if (values.widthUnit === "auto") {
        hidePropertyIn(defaultProperties, values, "width");
    }

    if (values.datasource === "icon" && (values.imageIcon?.type === "glyph" || values.imageIcon?.type === "icon")) {
        hidePropertiesIn(defaultProperties, values, ["widthUnit", "width", "heightUnit", "height"]);
    } else {
        hidePropertyIn(defaultProperties, values, "iconSize");
    }

    if (values.onClickType !== "action") {
        hidePropertyIn(defaultProperties, values, "onClick");
    }

    if (values.datasource !== "image") {
        hidePropertyIn(defaultProperties, values, "displayAs");
    }

    if (platform === "web") {
        transformGroupsIntoTabs(defaultProperties);
        reorderTabsForStudio(defaultProperties);
    }
    return defaultProperties;
}

export function getPreview(
    values: ImagePreviewProps,
    isDarkMode: boolean,
    version: number[]
): StructurePreviewProps | null {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

    if (!values.isBackgroundImage) {
        const [width, height, property] = getImageWithDimensions();
        return {
            type: "Image",
            document: decodeURIComponent(
                (isDarkMode ? StructurePreviewImageSvgDark : StructurePreviewImageSvg).replace(
                    "data:image/svg+xml,",
                    ""
                )
            ),
            property,
            width,
            height
        };
    }

    const titleHeader: RowLayoutProps = {
        type: "RowLayout",
        columnSize: "fixed",
        backgroundColor: palette.background.topbarData,
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [
                    {
                        type: "Text",
                        content: "Image",
                        fontColor: palette.text.primary
                    }
                ]
            }
        ]
    };
    return {
        type: "Container",
        children: [
            titleHeader,
            {
                type: "RowLayout",
                children: [
                    {
                        type: "Container",
                        borders: true,
                        children: [
                            {
                                type: "DropZone",
                                property: values.children,
                                placeholder: "Content: Place widgets here"
                            } as DropZoneProps
                        ]
                    }
                ]
            } as RowLayoutProps
        ]
    };

    function getImageWithDimensions(): [
        width?: number,
        height?: number,
        previewImage?: { type: "static"; imageUrl: string }
    ] {
        const imageObject =
            values.imageObject?.type === "static"
                ? values.imageObject // static image
                : values.defaultImageDynamic; // default image for dynamic image
        const previewImage = imageObject?.type === "static" && !!imageObject.imageUrl ? imageObject : undefined;

        let width: number | undefined;
        let height: number | undefined;
        if (values.widthUnit === "pixels" && values.width) {
            width = values.width;
        }
        if (values.heightUnit === "pixels" && values.height) {
            height = values.height;
        }
        if (width || height) {
            return [width, height, previewImage];
        }

        const supportsDynamicImageSize = (version?.[0] === 10 && version?.[1] >= 2) || version?.[0] > 10; // Mx 10.2 supports images to set their own size by default
        return supportsDynamicImageSize && !!previewImage
            ? [undefined, undefined, previewImage]
            : [100, 100, previewImage];
    }
}

export function check(values: ImagePreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (values.datasource === "image" && !values.imageObject) {
        errors.push({
            property: "imageObject",
            message: "No image selected."
        });
    }
    if (values.datasource === "imageUrl" && !values.imageUrl) {
        errors.push({
            property: "imageUrl",
            message: "No image link provided."
        });
    }
    if (values.datasource === "icon" && !values.imageIcon) {
        errors.push({
            property: "imageIcon",
            message: "No icon selected."
        });
    }

    return errors;
}

export function getCustomCaption(props: ImagePreviewProps): string {
    let caption: string;
    if (props.imageObject) {
        caption = props.imageObject.type === "static" ? props.imageObject.imageUrl : props.imageObject.entity;
    } else if (props.imageIcon) {
        caption = props.imageIcon.type === "image" ? props.imageIcon.imageUrl : props.imageIcon.iconClass; // until we have a better alternative
    } else {
        caption = props.imageUrl;
    }
    return caption === "" ? "(none)" : caption;
}
