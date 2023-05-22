import {
    ContainerProps,
    DropZoneProps,
    RowLayoutProps,
    StructurePreviewProps,
    TextProps,
    colorWithAlpha
} from "@mendix/pluggable-widgets-commons";
import { hidePropertiesIn, hidePropertyIn, Properties, transformGroupsIntoTabs } from "@mendix/pluggable-widgets-tools";

import { HeaderTypeEnum, TreeNodePreviewProps } from "../typings/TreeNodeProps";

import ChevronSVG from "./assets/ChevronStructurePreview.svg";
import ChevronSVGDark from "./assets/ChevronStructurePreviewDark.svg";

export function getProperties(
    values: TreeNodePreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    if (values.showIcon === "no") {
        hidePropertiesIn(defaultProperties, values, ["expandedIcon", "collapsedIcon"]);
    }

    if (values.headerType === "text") {
        hidePropertyIn(defaultProperties, values, "headerContent");
    } else if (values.headerType === "custom") {
        hidePropertyIn(defaultProperties, values, "headerCaption");
    }

    if (!values.hasChildren) {
        hidePropertiesIn(defaultProperties, values, ["startExpanded", "children"]);
    }

    if (platform === "web") {
        transformGroupsIntoTabs(defaultProperties);

        if (!values.advancedMode) {
            hidePropertiesIn(defaultProperties, values, [
                "showIcon",
                "expandedIcon",
                "collapsedIcon",
                "animate",
                "animateIcon"
            ]);
        }
    } else {
        hidePropertyIn(defaultProperties, values, "advancedMode");
    }
    return defaultProperties;
}

export function getPreview(values: TreeNodePreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    const paletteDark = {
        textPrimary: "#DEDEDE",
        topbarData: colorWithAlpha("#3A65E5", 20),
        topbarStandard: colorWithAlpha("#646464", 20)
    };

    const paletteLight = {
        textPrimary: "#2F3646",
        topbarData: "#DCEEEF",
        topbarStandard: "#F7F7F7"
    };

    const palette = isDarkMode ? paletteDark : paletteLight;

    const titleHeader: RowLayoutProps = {
        type: "RowLayout",
        columnSize: "fixed",
        backgroundColor: palette.topbarData,
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [
                    {
                        type: "Text",
                        content: "Tree node",
                        fontColor: palette.textPrimary
                    }
                ]
            }
        ]
    };
    const treeNodeHeader: RowLayoutProps = {
        type: "RowLayout",
        backgroundColor: palette.topbarStandard,
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                padding: 4,
                children: [
                    ...(values.showIcon === "left" && values.hasChildren
                        ? [getChevronIconPreview(values.headerType, isDarkMode)]
                        : []),
                    values.headerType === "text"
                        ? ({
                              type: "Text",
                              fontSize: 12,
                              bold: true,
                              grow: 100,
                              content: values.headerCaption || "[No header caption configured]"
                          } as TextProps)
                        : ({
                              type: "RowLayout",
                              borders: true,
                              grow: 100,
                              children: [
                                  {
                                      type: "DropZone",
                                      property: values.headerContent,
                                      placeholder: "Node header: Place widgets here"
                                  } as DropZoneProps
                              ]
                          } as RowLayoutProps),

                    ...(values.showIcon === "right" && values.hasChildren
                        ? [getChevronIconPreview(values.headerType, isDarkMode)]
                        : [])
                ]
            }
        ]
    };

    const getTreeNodeContent: () => StructurePreviewProps[] = () =>
        values.hasChildren
            ? [
                  {
                      type: "RowLayout",
                      borders: true,
                      borderWidth: 1,
                      children: [
                          {
                              type: "Container",
                              padding: 6,
                              children: [
                                  {
                                      type: "Container",
                                      borders: true,
                                      children: [
                                          {
                                              type: "DropZone",
                                              property: values.children,
                                              placeholder: "Node body: Place widgets here"
                                          } as DropZoneProps
                                      ]
                                  }
                              ]
                          }
                      ]
                  } as RowLayoutProps
              ]
            : [];

    return {
        type: "Container",
        children: [titleHeader, treeNodeHeader, ...getTreeNodeContent()]
    } as ContainerProps;
}

function getChevronIconPreview(headerType: HeaderTypeEnum, isDarkMode: boolean): ContainerProps {
    return {
        type: "Container",
        grow: 1,
        padding: headerType === "text" ? 8 : 27,
        children: [
            {
                type: "Image",
                document: decodeURIComponent(
                    (isDarkMode ? ChevronSVGDark : ChevronSVG).replace("data:image/svg+xml,", "")
                ),
                width: 14
            }
        ]
    };
}

export function getCustomCaption(values: TreeNodePreviewProps, _platform = "desktop"): string {
    return (values.datasource as { caption?: string }).caption || "Tree node";
}
