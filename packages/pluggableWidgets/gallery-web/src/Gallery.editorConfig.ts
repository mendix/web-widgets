import {
    ContainerProps,
    DropZoneProps,
    RowLayoutProps,
    StructurePreviewProps,
    datasource,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import {
    hidePropertiesIn,
    hidePropertyIn,
    Problem,
    Properties,
    transformGroupsIntoTabs
} from "@mendix/pluggable-widgets-tools";
import { GalleryPreviewProps } from "../typings/GalleryProps";

export function getProperties(
    values: GalleryPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    if (values.pagination !== "buttons") {
        hidePropertyIn(defaultProperties, values, "pagingPosition");
    }

    if (values.showEmptyPlaceholder === "none") {
        hidePropertyIn(defaultProperties, values, "emptyPlaceholder");
    }

    if (values.itemSelection === "None") {
        hidePropertiesIn(defaultProperties, values, ["onSelectionChange", "itemSelectionMode"]);
    }

    if (platform === "web") {
        if (!values.advanced) {
            hidePropertiesIn(defaultProperties, values, [
                "pagination",
                "pagingPosition",
                "showEmptyPlaceholder",
                "emptyPlaceholder",
                "itemClass",
                "filtersPlaceholder",
                "filterList",
                "sortList",
                "emptyMessageTitle",
                "filterSectionTitle"
            ]);
        }

        transformGroupsIntoTabs(defaultProperties);
    } else {
        hidePropertyIn(defaultProperties, values, "advanced");
    }

    return defaultProperties;
}

export function check(values: GalleryPreviewProps): Problem[] {
    const errors: Problem[] = [];
    if (!values.desktopItems || values.desktopItems < 1 || values.desktopItems > 12) {
        errors.push({
            property: "desktopItems",
            message: "Desktop items must be a number between 1 and 12"
        });
    }
    if (!values.phoneItems || values.phoneItems < 1 || values.phoneItems > 12) {
        errors.push({
            property: "phoneItems",
            message: "Phone items must be a number between 1 and 12"
        });
    }
    if (!values.tabletItems || values.tabletItems < 1 || values.tabletItems > 12) {
        errors.push({
            property: "tabletItems",
            message: "Tablet items must be a number between 1 and 12"
        });
    }
    if (values.itemSelection !== "None" && values.onClick && values.onClickTrigger === "single") {
        errors.push({
            severity: "error",
            property: "onClick",
            message:
                "The item click action is ambiguous. " +
                'Change "On click trigger" to "Double click" or set "Selection" to "None".'
        });
    }

    return errors;
}

export function getPreview(values: GalleryPreviewProps, isDarkMode: boolean): StructurePreviewProps {
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
                        content: "Gallery",
                        fontColor: palette.text.data
                    }
                ]
            }
        ]
    };
    const filters = {
        type: "RowLayout",
        columnSize: "fixed",
        borders: true,
        children: [
            {
                type: "DropZone",
                property: values.filtersPlaceholder,
                placeholder: "Place widgets like filter widget(s) and action button(s) here"
            } as DropZoneProps
        ]
    } as RowLayoutProps;

    const content = {
        type: "Container",
        borders: true,
        children: [
            {
                type: "RowLayout",
                columnSize: "fixed",
                children: [
                    {
                        type: "DropZone",
                        property: values.content,
                        placeholder: "Gallery item: Place widgets here"
                    } as DropZoneProps
                ]
            } as RowLayoutProps,
            {
                type: "RowLayout",
                columnSize: "grow",
                children: [
                    {
                        type: "Container",
                        grow: 1,
                        children: []
                    },
                    {
                        type: "Container",
                        grow: 0,
                        children: [
                            {
                                type: "Text",
                                content: `Desktop ${values.desktopItems} ${getSingularPlural(
                                    "Column",
                                    values.desktopItems!
                                )}, Tablet ${values.tabletItems} ${getSingularPlural(
                                    "Column",
                                    values.tabletItems!
                                )}, Phone ${values.phoneItems} ${getSingularPlural("Column", values.phoneItems!)}`,
                                fontColor: palette.text.secondary
                            }
                        ]
                    }
                ]
            } as RowLayoutProps
        ]
    } as ContainerProps;

    const footer =
        values.showEmptyPlaceholder === "custom"
            ? [
                  {
                      type: "RowLayout",
                      columnSize: "fixed",
                      borders: true,
                      children: [
                          {
                              type: "DropZone",
                              property: values.emptyPlaceholder,
                              placeholder: "Empty gallery message: Place widgets here"
                          } as DropZoneProps
                      ]
                  } as RowLayoutProps
              ]
            : [];

    return {
        type: "Container",
        children: [titleHeader, filters, content, ...footer]
    };
}

function getSingularPlural(word: string, elements: number): string {
    return elements > 1 ? word + "s" : word;
}

export function getCustomCaption(values: GalleryPreviewProps): string {
    type DsProperty = { caption?: string };
    const dsProperty: DsProperty = datasource(values.datasource)().property ?? {};
    return dsProperty.caption || "Gallery";
}
