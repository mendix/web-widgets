import {
    changePropertyIn,
    hideNestedPropertiesIn,
    hidePropertiesIn,
    hidePropertyIn,
    Properties,
    transformGroupsIntoTabs
} from "@mendix/pluggable-widgets-tools";
import {
    container,
    datasource,
    dropzone,
    rowLayout,
    selectable,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";

import { ColumnsPreviewType, DatagridPreviewProps } from "../typings/DatagridProps";

export function getProperties(
    values: DatagridPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    values.columns.forEach((column, index) => {
        if (column.showContentAs !== "attribute" && !column.sortable && !values.columnsFilterable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "attribute");
        }
        if (column.showContentAs !== "dynamicText") {
            hidePropertyIn(defaultProperties, values, "columns", index, "dynamicText");
        }
        if (column.showContentAs !== "customContent") {
            hideNestedPropertiesIn(defaultProperties, values, "columns", index, [
                "content",
                "allowEventPropagation",
                "exportValue"
            ]);
        }
        if (column.showContentAs === "customContent") {
            hidePropertyIn(defaultProperties, values, "columns", index, "tooltip");
        }
        if (!values.columnsSortable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "sortable");
        }
        if (!values.columnsFilterable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "filter");
        }
        if (!values.columnsResizable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "resizable");
        }
        if (!values.columnsDraggable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "draggable");
        }
        if (!values.columnsHidable) {
            hidePropertyIn(defaultProperties, values, "columns", index, "hidable");
        }
        if (column.width !== "manual") {
            hidePropertyIn(defaultProperties, values, "columns", index, "size");
        }
        if (column.width !== "autoFit") {
            hidePropertyIn(defaultProperties, values, "columns", index, "minWidth");
        }
        if (column.minWidth !== "manual") {
            hidePropertyIn(defaultProperties, values, "columns", index, "minWidthLimit");
        }
        if (!values.advanced && platform === "web") {
            hideNestedPropertiesIn(defaultProperties, values, "columns", index, [
                "columnClass",
                "sortable",
                "resizable",
                "draggable",
                "hidable"
            ]);
        }

        if (!column.filterAssociation) {
            hideNestedPropertiesIn(defaultProperties, values, "columns", index, [
                "filterAssociationOptions",
                "filterAssociationOptionLabel",
                "fetchOptionsLazy",
                "filterCaptionType",
                "filterAssociationOptionLabelAttr"
            ]);
        }
        if (column.filterCaptionType === "attribute") {
            hidePropertyIn(defaultProperties, values, "columns", index, "filterAssociationOptionLabel");
        } else {
            hidePropertyIn(defaultProperties, values, "columns", index, "filterAssociationOptionLabelAttr");
        }
    });
    if (values.pagination === "buttons") {
        hidePropertyIn(defaultProperties, values, "showNumberOfRows");
    } else {
        hidePropertyIn(defaultProperties, values, "showPagingButtons");

        if (values.showNumberOfRows === false) {
            hidePropertyIn(defaultProperties, values, "pagingPosition");
        }
    }

    if (values.pagination !== "loadMore") {
        hidePropertyIn(defaultProperties, values, "loadMoreButtonCaption");
    }
    if (values.showEmptyPlaceholder === "none") {
        hidePropertyIn(defaultProperties, values, "emptyPlaceholder");
    }

    hideSelectionProperties(defaultProperties, values);

    changePropertyIn(
        defaultProperties,
        values,
        prop => {
            prop.objectHeaders = ["Caption", "Content", "Width", "Alignment"];
            prop.objects?.forEach((object, index) => {
                const column = values.columns[index];
                const header = column.header ? column.header : "[Empty caption]";
                const alignment = column.alignment;
                object.captions = [
                    header,
                    column.showContentAs === "attribute"
                        ? column.attribute
                            ? column.attribute
                            : "[No attribute selected]"
                        : column.showContentAs === "dynamicText"
                        ? column.dynamicText
                        : "Custom content",
                    column.width === "autoFill"
                        ? "Auto-fill"
                        : column.width === "autoFit"
                        ? `Auto-fit content`
                        : `Manual (${column.size})`,
                    alignment ? alignment.charAt(0).toUpperCase() + alignment.slice(1) : ""
                ];
            });
        },
        "columns"
    );

    if (platform === "web") {
        if (!values.advanced) {
            hidePropertiesIn(defaultProperties, values, [
                "pagination",
                "pagingPosition",
                "showEmptyPlaceholder",
                "rowClass",
                "columnsSortable",
                "columnsDraggable",
                "columnsResizable",
                "columnsHidable",
                "configurationAttribute",
                "onConfigurationChange",
                "filterList",
                "filtersPlaceholder",
                "filterSectionTitle"
            ]);
        }

        transformGroupsIntoTabs(defaultProperties);
    } else {
        hidePropertyIn(defaultProperties, values, "advanced");
    }

    if (values.configurationStorageType === "localStorage") {
        hidePropertiesIn(defaultProperties, values, ["configurationAttribute", "onConfigurationChange"]);
    }

    return defaultProperties;
}

function hideSelectionProperties(defaultProperties: Properties, values: DatagridPreviewProps): void {
    const { itemSelection, itemSelectionMethod } = values;

    if (itemSelection === "None") {
        hidePropertiesIn(defaultProperties, values, ["itemSelectionMethod", "itemSelectionMode", "onSelectionChange"]);
    }

    if (itemSelectionMethod === "checkbox") {
        hidePropertyIn(defaultProperties, values, "itemSelectionMode");
    }

    if (itemSelection !== "Multi" || itemSelectionMethod !== "checkbox") {
        hidePropertyIn(defaultProperties, values, "showSelectAllToggle");
    }
}

export const getPreview = (
    values: DatagridPreviewProps,
    isDarkMode: boolean,
    spVersion: number[] = [0, 0, 0]
): StructurePreviewProps => {
    const [major, minor] = spVersion;
    const canHideDataSourceHeader = major > 9 || (major === 9 && minor >= 20);
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

    const modeColor = (colorDark: string, colorLight: string): string => (isDarkMode ? colorDark : colorLight);

    const hasColumns = values.columns && values.columns.length > 0;
    const columnProps: ColumnsPreviewType[] = hasColumns
        ? values.columns
        : [
              {
                  alignment: "left",
                  attribute: "",
                  columnClass: "",
                  content: { widgetCount: 0, renderer: () => null },
                  draggable: false,
                  dynamicText: "Dynamic text",
                  filter: { widgetCount: 0, renderer: () => null },
                  filterAssociation: "",
                  filterAssociationOptionLabel: "",
                  filterAssociationOptionLabelAttr: "",
                  filterAssociationOptions: {},
                  filterCaptionType: "attribute",
                  header: "Column",
                  hidable: "no",
                  resizable: false,
                  showContentAs: "attribute",
                  size: 1,
                  sortable: false,
                  tooltip: "",
                  visible: "true",
                  width: "autoFit",
                  wrapText: false,
                  minWidth: "auto",
                  minWidthLimit: 100,
                  allowEventPropagation: true,
                  exportValue: "",
                  fetchOptionsLazy: true
              }
          ];
    const columns = rowLayout({
        columnSize: "fixed"
    })(
        ...columnProps.map(column =>
            container({
                borders: true,
                grow: column.width === "manual" && column.size ? column.size : 1,
                backgroundColor:
                    values.columnsHidable && column.hidable === "hidden" ? modeColor("#3E3E3E", "#F5F5F5") : undefined
            })(
                column.showContentAs === "customContent"
                    ? dropzone(dropzone.hideDataSourceHeaderIf(canHideDataSourceHeader))(column.content)
                    : container({
                          padding: 8
                      })(
                          text({ fontSize: 10, fontColor: palette.text.secondary })(
                              column.showContentAs === "dynamicText"
                                  ? column.dynamicText ?? "Dynamic text"
                                  : `[${column.attribute ? column.attribute : "No attribute selected"}]`
                          )
                      )
            )
        )
    );
    const gridTitle = rowLayout({
        columnSize: "fixed",
        backgroundColor: palette.background.topbarData,
        borders: true,
        borderWidth: 1
    })(
        container({
            padding: 4
        })(text({ fontColor: palette.text.data })("Data grid 2"))
    );
    const gridHeaderWidgets = rowLayout({
        columnSize: "fixed",
        borders: true
    })(
        dropzone(
            dropzone.placeholder("Place widgets like filter widget(s) and action button(s) here"),
            dropzone.hideDataSourceHeaderIf(canHideDataSourceHeader)
        )(values.filtersPlaceholder)
    );

    const columnHeaders = rowLayout({
        columnSize: "fixed"
    })(
        ...columnProps.map(column => {
            const isColumnHidden = values.columnsHidable && column.hidable === "hidden";
            const content = container({
                borders: true,
                grow:
                    values.columns.length > 0
                        ? column.width === "manual" && column.size
                            ? column.size
                            : 1
                        : undefined,
                backgroundColor: isColumnHidden ? modeColor("#4F4F4F", "#DCDCDC") : palette.background.topbarStandard
            })(
                rowLayout({
                    columnSize: "grow"
                })(
                    container({
                        grow: 0,
                        backgroundColor: "#AEEdAA"
                    })(
                        container({
                            padding: column.visible.trim() === "" || column.visible.trim() === "true" ? 0 : 3
                        })()
                    ),
                    container({
                        padding: 8
                    })(
                        container({
                            grow: 1,
                            padding: 8
                        })(
                            text({
                                bold: true,
                                fontSize: 10,
                                fontColor: column.header
                                    ? undefined
                                    : isColumnHidden
                                    ? modeColor("#4F4F4F", "#DCDCDC")
                                    : palette.text.secondary
                            })(column.header ? column.header : "Header")
                        ),
                        ...(hasColumns && values.columnsFilterable
                            ? [
                                  dropzone(
                                      dropzone.placeholder("Place filter widget here"),
                                      dropzone.hideDataSourceHeaderIf(canHideDataSourceHeader)
                                  )(column.filter)
                              ]
                            : [])
                    )
                )
            );
            return values.columns.length > 0
                ? selectable(column, { grow: column.width === "manual" && column.size ? column.size : 1 })(
                      container()(content)
                  )
                : content;
        })
    );
    const customEmptyMessageWidgets =
        values.showEmptyPlaceholder === "custom"
            ? [
                  rowLayout({
                      columnSize: "fixed",
                      borders: true
                  })(
                      dropzone(
                          dropzone.placeholder("Empty list message: Place widgets here"),
                          dropzone.hideDataSourceHeaderIf(canHideDataSourceHeader)
                      )(values.emptyPlaceholder)
                  )
              ]
            : [];

    return container()(
        gridTitle,
        ...(canHideDataSourceHeader ? [datasource(values.datasource)()] : []),
        gridHeaderWidgets,
        columnHeaders,
        ...Array.from({ length: 5 }).map(() => columns),
        ...customEmptyMessageWidgets
    );
};

export { check } from "./consistency-check";

export function getCustomCaption(values: DatagridPreviewProps): string {
    type DsProperty = { caption?: string };
    const dsProperty: DsProperty = datasource(values.datasource)().property ?? {};
    return dsProperty.caption || "Data grid 2";
}
