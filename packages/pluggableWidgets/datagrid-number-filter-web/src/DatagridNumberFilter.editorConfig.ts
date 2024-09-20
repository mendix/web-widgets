import {
    ContainerProps,
    ImageProps,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import {
    emptyIcon,
    emptyIconDark,
    equalsIcon,
    equalsIconDark,
    greaterThanEqualIcon,
    greaterThanEqualIconDark,
    greaterThanIcon,
    greaterThanIconDark,
    notEmptyIcon,
    notEmptyIconDark,
    notEqualIcon,
    notEqualIconDark,
    smallerThanEqualIcon,
    smallerThanEqualIconDark,
    smallerThanIcon,
    smallerThanIconDark
} from "@mendix/widget-plugin-filter-selector/editor-preview-icons";
import { hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";

import { DatagridNumberFilterPreviewProps, DefaultFilterEnum } from "../typings/DatagridNumberFilterProps";

export function getProperties(
    values: DatagridNumberFilterPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    if (!values.adjustable) {
        hidePropertyIn(defaultProperties, values, "screenReaderButtonCaption");
    }
    if (platform === "web") {
        if (!values.advanced) {
            hidePropertiesIn(defaultProperties, values, ["onChange", "valueAttribute"]);
        }
    } else {
        hidePropertyIn(defaultProperties, values, "advanced");
    }
    return defaultProperties;
}

export const getPreview = (values: DatagridNumberFilterPreviewProps, isDarkMode: boolean): StructurePreviewProps => {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const adjustableByUserContainer = values.adjustable
        ? [
              {
                  type: "Container",
                  padding: 2,
                  grow: 0,
                  children: [
                      {
                          type: "Image",
                          document: getSvgContent(values.defaultFilter, isDarkMode)
                      } as ImageProps
                  ]
              } as ContainerProps,
              {
                  type: "Container",
                  borders: true,
                  borderWidth: 0.5,
                  grow: 0
              } as ContainerProps
          ]
        : [];
    return {
        type: "RowLayout",
        borders: true,
        borderRadius: 5,
        borderWidth: 1,
        columnSize: "grow",
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                backgroundColor: palette.background.container,
                children: [
                    ...adjustableByUserContainer,
                    {
                        type: "Container",
                        padding: 8,
                        children: [
                            text({
                                fontColor: palette.text.secondary,
                                italic: true
                            })(values.placeholder || " ")
                        ],
                        grow: 1
                    } as ContainerProps
                ]
            }
        ]
    };
};

function getSvgContent(type: DefaultFilterEnum, isDarkMode: boolean): string {
    switch (type) {
        case "equal":
            return isDarkMode ? equalsIconDark : equalsIcon;
        case "notEqual":
            return isDarkMode ? notEqualIconDark : notEqualIcon;
        case "greater":
            return isDarkMode ? greaterThanIconDark : greaterThanIcon;
        case "greaterEqual":
            return isDarkMode ? greaterThanEqualIconDark : greaterThanEqualIcon;
        case "smaller":
            return isDarkMode ? smallerThanIconDark : smallerThanIcon;
        case "smallerEqual":
            return isDarkMode ? smallerThanEqualIconDark : smallerThanEqualIcon;
        case "empty":
            return isDarkMode ? emptyIconDark : emptyIcon;
        case "notEmpty":
            return isDarkMode ? notEmptyIconDark : notEmptyIcon;
    }
}
