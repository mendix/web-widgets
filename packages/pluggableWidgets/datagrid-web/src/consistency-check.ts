import { Problem } from "@mendix/pluggable-widgets-tools";
import { ColumnsPreviewType, DatagridPreviewProps } from "../typings/DatagridProps";

export function check(values: DatagridPreviewProps): Problem[] {
    const errors: Problem[] = [];

    const columnChecks = [checkDisplaySettings, checkSortingSettings, checkHidableSettings];

    values.columns.forEach((column: ColumnsPreviewType, index) => {
        for (const check of columnChecks) {
            const error = check(values, column, index);
            if (error) {
                errors.push(error);
            }
        }
    });

    errors.push(...checkSelectionSettings(values));
    errors.push(...checkFilterFields(values));

    const customPaginationPositionError = checkCustomPaginationPosition(values);
    if (customPaginationPositionError) {
        errors.push(customPaginationPositionError);
    }

    return errors;
}

const columnPropPath = (prop: string, index: number): string => `columns/${index + 1}/${prop}`;

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
            severity: "warning",
            message:
                "A caption is required if 'Can hide' is Yes or Yes, hidden by default. This can be configured under 'Column capabilities' in the column item properties"
        };
    }
};

const checkCustomPaginationPosition = (values: DatagridPreviewProps): Problem | undefined => {
    if (values.useCustomPagination && values.pagingPosition === "both") {
        return {
            property: "pagingPosition",
            severity: "warning",
            message:
                "Custom pagination cannot be shown in both positions and will render below the grid. " +
                'Set "Position of pagination" to "Above grid" or "Below grid" to choose a single position.'
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

const checkFilterFields = (values: DatagridPreviewProps): Problem[] => {
    const errors: Problem[] = [];
    const fields = values.filterFields ?? [];
    const options = values.filterFieldOptions ?? [];
    const seen = new Set<string>();

    if (values.filteringMode === "dynamic" && fields.length === 0) {
        errors.push({
            property: "filterFields",
            message: "Add at least one filter field when 'Filtering mode' is set to 'Dynamic filters'."
        });
    }

    fields.forEach((field, index) => {
        const key = field.key.trim();
        if (key === "") {
            errors.push({
                property: `filterFields/${index + 1}/key`,
                message: `The key of filter field (${field.label || index + 1}) is empty. Enter a unique key.`
            });
        } else if (seen.has(key)) {
            errors.push({
                property: `filterFields/${index + 1}/key`,
                message: `The filter field key '${key}' is used more than once. Filter field keys must be unique.`
            });
        }
        seen.add(key);
    });

    options.forEach((option, index) => {
        if (!seen.has(option.fieldKey.trim())) {
            errors.push({
                property: `filterFieldOptions/${index + 1}/fieldKey`,
                message: `No filter field has the key '${option.fieldKey}'. Enter the key of an existing filter field.`
            });
        }
    });

    return errors;
};
