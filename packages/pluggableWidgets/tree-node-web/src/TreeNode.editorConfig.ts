import {
    ContainerProps,
    DropZoneProps,
    RowLayoutProps,
    StructurePreviewProps,
    TextProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import {
    hidePropertiesIn,
    hidePropertyIn,
    Problem,
    Properties,
    transformGroupsIntoTabs
} from "@mendix/pluggable-widgets-tools";

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
        hidePropertyIn(defaultProperties, values, "openNodeOn");
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
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

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
                        content: "Tree node",
                        fontColor: palette.text.primary
                    }
                ]
            }
        ]
    };
    const treeNodeHeader: RowLayoutProps = {
        type: "RowLayout",
        backgroundColor: palette.background.topbarStandard,
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

export function check(props: TreeNodePreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (props.openNodeOn === "iconClick" && props.showIcon === "no") {
        errors.push({
            property: "openNodeOn",
            message:
                'The header icon is required to be visible when "Open node on" is set to "Icon is clicked". Right now, the "Show icon" is set to "No".'
        });
    }

    return errors;
}
