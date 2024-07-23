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
    errors.push(...checkGroupProps(values));
    errors.push(...checkGroupAttrs(values));

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

    if (!column.filterAssociationOptionLabel) {
        return {
            property: columnPropPath("filterAssociationOptionLabel", index),
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

const checkGroupProps = (values: DatagridPreviewProps): Problem[] => {
    const errors: Problem[] = [];
    let sizeMap: { [key: string]: number } = Object.fromEntries(values.groupList.map(grp => [grp.key, 0]));
    if (values.groupAttrs.length > 0) {
        sizeMap = values.groupAttrs.reduce<typeof sizeMap>(
            (acc, attr) => {
                if (Object.hasOwn(acc, attr.key)) {
                    acc[attr.key] += 1;
                }
                return acc;
            },
            { ...sizeMap }
        );
    }

    values.groupList.forEach((group, index) => {
        const idx = `Groups{${index + 1}}`;
        const name = group.key ? `${idx} (${group.key})` : idx;
        const prefix = `Grid wide filtering/${name}`;

        if (group.type === "reference") {
            if (group.ref === "") {
                errors.push({
                    severity: "error",
                    message: `${prefix}: Property 'Reference' is required.`
                });
            }
            if (group.refOptions === null) {
                errors.push({
                    severity: "error",
                    message: `${prefix}: Property 'Options source' is required.`
                });
            }
            if (group.caption === "") {
                errors.push({
                    severity: "error",
                    message: `${prefix}: Property 'Option caption' is required.`
                });
            }
        } else if (group.key.length > 0) {
            if (sizeMap[group.key] === 0) {
                errors.push({
                    severity: "error",
                    message: `${prefix}: group has no attributes. At least one attribute with key '${group.key}' is required.`
                });
            }
        }
    });

    return errors;
};

const checkGroupAttrs = (props: DatagridPreviewProps): Problem[] => {
    const errors: Problem[] = [];
    const groupKeys = new Set(props.groupList.map(grp => grp.key));

    props.groupAttrs.forEach((attr, index) => {
        if (attr.key.length > 0 && !groupKeys.has(attr.key)) {
            const prefix = `Grid wide filtering/Group attributes{${index + 1}}`;
            errors.push({
                severity: "error",
                message: `${prefix}: Unable to find group with key '${attr.key}'. Check 'Groups' settings.`
            });
        }
    });

    return errors;
};
