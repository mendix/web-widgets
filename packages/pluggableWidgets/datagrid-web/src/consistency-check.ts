import { Problem } from "@mendix/pluggable-widgets-tools";
import { ColumnsPreviewType, DatagridPreviewProps } from "../typings/DatagridProps";

export function check(values: DatagridPreviewProps): Problem[] {
    const errors: Problem[] = [];

    const columnChecks = [
        checkAssociationSettings,
        checkFilteringSettings,
        checkDisplaySettings,
        checkSortingSettings,
        checkHidableSettings
    ];

    values.columns.forEach((column: ColumnsPreviewType, index) => {
        for (const check of columnChecks) {
            const error = check(values, column, index);
            if (error) {
                errors.push(error);
            }
        }
    });

    errors.push(...checkSelectionSettings(values));

    return errors;
}

const columnPropPath = (prop: string, index: number): string => `columns/${index + 1}/${prop}`;

const checkAssociationSettings = (
    values: DatagridPreviewProps,
    column: ColumnsPreviewType,
    index: number
): Problem | undefined => {
    if (!values.columnsFilterable) {
        return;
    }

    if (!column.filterAssociation) {
        return;
    }

    if (column.filterCaptionType === "expression" && !column.filterAssociationOptionLabel) {
        return {
            property: columnPropPath("filterAssociationOptionLabel", index),
            message: `A caption is required when using associations. Please set 'Option caption' property for column (${column.header})`
        };
    }

    if (column.filterCaptionType === "attribute" && !column.filterAssociationOptionLabelAttr) {
        return {
            property: columnPropPath("filterAssociationOptionLabelAttr", index),
            message: `A caption is required when using associations. Please set 'Option caption' property for column (${column.header})`
        };
    }
};

const checkFilteringSettings = (
    values: DatagridPreviewProps,
    column: ColumnsPreviewType,
    index: number
): Problem | undefined => {
    if (!values.columnsFilterable) {
        return;
    }

    if (!column.attribute && !column.filterAssociation) {
        return {
            property: columnPropPath("attribute", index),
            message: `An attribute or reference is required when filtering is enabled. Please select 'Attribute' or 'Reference' property for column (${column.header})`
        };
    }
};

const checkDisplaySettings = (
    _values: DatagridPreviewProps,
    column: ColumnsPreviewType,
    index: number
): Problem | undefined => {
    if (column.showContentAs === "attribute" && !column.attribute) {
        return {
            property: columnPropPath("attribute", index),
            message: `An attribute is required when 'Show' is set to 'Attribute'. Select the 'Attribute' property for column (${column.header})`
        };
    }
};

const checkSortingSettings = (
    values: DatagridPreviewProps,
    column: ColumnsPreviewType,
    index: number
): Problem | undefined => {
    if (!values.columnsSortable) {
        return;
    }

    if (column.sortable && !column.attribute) {
        return {
            property: columnPropPath("attribute", index),
            message: `An attribute is required when column sorting is enabled. Select the 'Attribute' property for column (${column.header}) or disable sorting in column settings`
        };
    }
};

const checkHidableSettings = (
    values: DatagridPreviewProps,
    column: ColumnsPreviewType,
    index: number
): Problem | undefined => {
    if (values.columnsHidable && column.hidable !== "no" && !column.header) {
        return {
            property: columnPropPath("hidable", index),
            message:
                "A caption is required if 'Can hide' is Yes or Yes, hidden by default. This can be configured under 'Column capabilities' in the column item properties"
        };
    }
};

const checkSelectionSettings = (values: DatagridPreviewProps): Problem[] => {
    const errors: Problem[] = [];

    if (values.itemSelection === "None" || values.onClick === null) {
        return errors;
    }

    if (values.onClickTrigger === "single" && values.itemSelectionMethod === "rowClick") {
        return [
            {
                severity: "error",
                message:
                    "The row click action is ambiguous. " +
                    'Change "On click trigger" to "Double click" or "Selection method" to "Checkbox".'
            }
        ];
    }

    return [];
};
