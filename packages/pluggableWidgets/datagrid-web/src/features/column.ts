import { AssociationProperties } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { ensure } from "@mendix/pluggable-widgets-commons/dist/utils/ensure";
import { ColumnsPreviewType, ColumnsType } from "typings/DatagridProps";

export function getAssociationProps(columnProps: ColumnsType): AssociationProperties {
    const msg = (propName: string): string =>
        `Can't map ColumnsType to AssociationProperties: ${propName} is undefined`;

    const association = ensure(columnProps.filterAssociation, msg("filterAssociation"));
    const optionsSource = ensure(columnProps.filterAssociationOptions, msg("filterAssociationOptions"));
    const labelSource = ensure(columnProps.filterAssociationOptionLabel, msg("filterAssociationOptionLabel"));

    const props: AssociationProperties = {
        association,
        optionsSource,
        getOptionLabel: item => labelSource.get(item).value ?? "Error: unable to get caption"
    };

    return props;
}

export function getColumnAssociationProps(settings: ColumnsType): AssociationProperties | undefined {
    if (!settings.filterAssociation) {
        return;
    }

    return getAssociationProps(settings);
}

export function isSortable(column: ColumnsType | ColumnsPreviewType): boolean {
    // Handle case for editorPreview
    const attrSortable = typeof column.attribute === "string" || !!column.attribute?.sortable;

    return column.sortable && attrSortable;
}
