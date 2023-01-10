import { ReferenceProperties } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { ensure } from "@mendix/pluggable-widgets-commons/dist/utils/ensure";
import { ColumnsType } from "typings/DatagridProps";

export function columnSettingsToReferenceProps(settings: ColumnsType): ReferenceProperties {
    const msg = (propName: string): string => `Can't map ColumnsType to ReferenceProperties: ${propName} is undefined`;

    return {
        referenceToMatch: ensure(settings.referenceToMatch, msg("referenceToMatch")),
        referenceAttribute: ensure(settings.referenceAttribute, msg("referenceAttribute")),
        referenceOptionsSource: ensure(settings.referenceOptionsSource, msg("referenceOptionsSource"))
    };
}

export function getColumnReferenceProps(settings: ColumnsType): ReferenceProperties | undefined {
    if (!settings.enableAssociationFilter) {
        return;
    }

    return columnSettingsToReferenceProps(settings);
}
