import {
    container,
    datasource,
    dropzone,
    rowLayout,
    selectable,
    StructurePreviewProps,
    text
} from "@mendix/pluggable-widgets-commons";
import {
    changePropertyIn,
    hideNestedPropertiesIn,
    hidePropertiesIn,
    hidePropertyIn,
    Problem,
    Properties,
    transformGroupsIntoTabs
} from "@mendix/pluggable-widgets-tools";

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
            hidePropertyIn(defaultProperties, values, "columns", index, "content");
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
                "filterAssociationOptionLabel"
            ]);
        } else {
            hidePropertyIn(defaultProperties, values, "columns", index, "sortable");
        }
    });
    if (values.pagination !== "buttons") {
        hidePropertyIn(defaultProperties, values, "pagingPosition");
    }
    if (values.showEmptyPlaceholder === "none") {
        hidePropertyIn(defaultProperties, values, "emptyPlaceholder");
    }
    if (!values.showHeaderFilters) {
        hidePropertyIn(defaultProperties, values, "filterList");
    }

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
                        ? "Auto-fit content"
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
                "showHeaderFilters",
                "filterList",
                "filtersPlaceholder",
                "filterSectionTitle"
            ]);
        }

        transformGroupsIntoTabs(defaultProperties);
    } else {
        hidePropertyIn(defaultProperties, values, "advanced");
    }

    return defaultProperties;
}

export const getPreview = (
    values: DatagridPreviewProps,
    isDarkMode: boolean,
    spVersion: number[] = [0, 0, 0]
): StructurePreviewProps => {
    const [x, y] = spVersion;
    const canHideDataSourceHeader = x >= 9 && y >= 20;

    const modeColor = (colorDark: string, colorLight: string): string => (isDarkMode ? colorDark : colorLight);

    const hasColumns = values.columns && values.columns.length > 0;
    const columnProps: ColumnsPreviewType[] = hasColumns
        ? values.columns
        : [
              {
                  header: "Column",
                  tooltip: "",
                  attribute: "",
                  width: "autoFit",
                  columnClass: "",
                  filter: { widgetCount: 0, renderer: () => null },
                  resizable: false,
                  showContentAs: "attribute",
                  content: { widgetCount: 0, renderer: () => null },
                  dynamicText: "Dynamic text",
                  draggable: false,
                  hidable: "no",
                  size: 1,
                  sortable: false,
                  alignment: "left",
                  wrapText: false,
                  enableAssociationFilter: false,
                  filterAssociation: "",
                  filterAssociationOptions: {},
                  filterAssociationOptionLabel: ""
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
                          text({ fontSize: 10 })(
                              column.showContentAs === "dynamicText"
                                  ? column.dynamicText ?? "Dynamic text"
                                  : `[${column.attribute ? column.attribute : "No attribute selected"}]`
                          )
                      )
            )
        )
    );
    const titleHeader = rowLayout({
        columnSize: "fixed",
        backgroundColor: modeColor("#3B5C8F", "#DAEFFB"),
        borders: true,
        borderWidth: 1
    })(
        container({
            padding: 4
        })(text({ fontColor: modeColor("#6DB1FE", "#2074C8") })("Data grid 2"))
    );
    const headerFilters = rowLayout({
        columnSize: "fixed",
        borders: true
    })(
        dropzone(
            dropzone.placeholder("Place filter widget(s) here"),
            dropzone.hideDataSourceHeaderIf(canHideDataSourceHeader)
        )(values.filtersPlaceholder)
    );

    const headers = rowLayout({
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
                backgroundColor: isColumnHidden ? modeColor("#4F4F4F", "#DCDCDC") : modeColor("#3E3E3E", "#F5F5F5")
            })(
                container({
                    padding: 8
                })(
                    text({
                        bold: true,
                        fontSize: 10,
                        fontColor: column.header
                            ? undefined
                            : isColumnHidden
                            ? modeColor("#4F4F4F", "#DCDCDC")
                            : modeColor("#3E3E3E", "#F5F5F5")
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
            );
            return values.columns.length > 0
                ? selectable(column, { grow: column.width === "manual" && column.size ? column.size : 1 })(
                      container()(content)
                  )
                : content;
        })
    );
    const footer =
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
        titleHeader,
        ...(canHideDataSourceHeader ? [datasource(values.datasource)()] : []),
        ...(values.showHeaderFilters && values.filterList.length > 0 ? [headerFilters] : []),
        headers,
        ...Array.from({ length: 5 }).map(() => columns),
        ...footer
    );
};

export function check(values: DatagridPreviewProps): Problem[] {
    const errors: Problem[] = [];

    const columnPropPath = (prop: string, index: number): string => `columns/${index + 1}/${prop}`;

    const checkAssociationSettings = (column: ColumnsPreviewType, index: number): Problem | undefined => {
        if (!column.enableAssociationFilter) {
            return undefined;
        }

        // filterAssociationOptions - it will be checked by studio pro.
        const props = ["filterAssociation", "filterAssociationOptionLabel"] as const;
        const propMessage: Record<typeof props[number], string> = {
            filterAssociation: "association is not configured.",
            filterAssociationOptionLabel: "caption expression is not configured."
        };

        for (const prop of props) {
            if (!column[prop]) {
                return {
                    property: columnPropPath(prop, index),
                    message: `Column error (${column.header}): ${propMessage[prop]}`
                };
            }
        }
    };

    const checkColumnAttribute = (
        values: DatagridPreviewProps,
        column: ColumnsPreviewType,
        index: number
    ): Problem | undefined => {
        if (column.attribute) {
            return;
        }

        const canSort = values.columnsSortable && column.sortable;
        if (column.showContentAs === "attribute") {
            return {
                property: columnPropPath("attribute", index),
                message: `An attribute is required when 'Show' is set to 'Attribute'. Select the 'Attribute' property for column ${column.header}`
            };
        }

        if (!column.enableAssociationFilter && (canSort || values.columnsFilterable)) {
            return {
                property: columnPropPath("attribute", index),
                message: `An attribute is required when filtering or sorting is enabled. Select the 'Attribute' property for column ${column.header}`
            };
        }
    };

    values.columns.forEach((column: ColumnsPreviewType, index) => {
        const associationError = checkAssociationSettings(column, index);
        if (associationError) {
            errors.push(associationError);
        }

        const attributeError = checkColumnAttribute(values, column, index);
        if (attributeError) {
            errors.push(attributeError);
        }

        if (values.columnsHidable && column.hidable !== "no" && !column.header) {
            errors.push({
                property: columnPropPath("hidable", index),
                message:
                    "A caption is required if 'Can hide' is Yes or Yes, hidden by default. This can be configured under 'Column capabilities' in the column item properties"
            });
        }
    });

    return errors;
}
