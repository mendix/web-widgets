import {
    ContainerProps,
    ImageProps,
    StructurePreviewProps,
    text,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import {
    containsIcon,
    containsIconDark,
    emptyIcon,
    emptyIconDark,
    endsWithIcon,
    endsWithIconDark,
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
    smallerThanIconDark,
    startsWithIcon,
    startsWithIconDark
} from "@mendix/widget-plugin-filter-selector/editor-preview-icons";
import { hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";

import { DatagridTextFilterPreviewProps, DefaultFilterEnum } from "../typings/DatagridTextFilterProps";

export function getProperties(
    values: DatagridTextFilterPreviewProps,
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

export const getPreview = (values: DatagridTextFilterPreviewProps, isDarkMode: boolean): StructurePreviewProps => {
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
        columnSize: "grow",
        borders: true,
        borderRadius: 5,
        borderWidth: 1,
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
        case "contains":
            return isDarkMode ? containsIconDark : containsIcon;
        case "endsWith":
            return isDarkMode ? endsWithIconDark : endsWithIcon;
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
        case "startsWith":
            return isDarkMode ? startsWithIconDark : startsWithIcon;
        case "empty":
            return isDarkMode ? emptyIconDark : emptyIcon;
        case "notEmpty":
            return isDarkMode ? notEmptyIconDark : notEmptyIcon;
    }
}
