import { Big } from "big.js";
import { CheckboxRadioSelectionPreviewProps } from "../../typings/CheckboxRadioSelectionProps";

export function _valuesIsEqual(
    value1: string | Big | boolean | Date | undefined,
    value2: string | Big | boolean | Date | undefined
): boolean {
    if (value1 === value2) {
        return true;
    }

    if (value1 instanceof Big && value2 instanceof Big) {
        return value1.eq(value2);
    }

    if (value1 instanceof Date && value2 instanceof Date) {
        return value1.getTime() === value2.getTime();
    }

    return false;
}

export function getCustomCaption(values: CheckboxRadioSelectionPreviewProps): string {
    const {
        optionsSourceType,
        optionsSourceAssociationDataSource,
        attributeEnumeration,
        attributeBoolean,
        databaseAttributeString,
        source,
        optionsSourceDatabaseDataSource,
        staticAttribute,
        optionsSourceStaticDataSource,
        controlType
    } = values;
    const emptyStringFormat = "Checkbox Radio Selection";
    if (source === "context") {
        switch (optionsSourceType) {
            case "association":
                return (optionsSourceAssociationDataSource as { caption?: string })?.caption || emptyStringFormat;
            case "enumeration":
                return `[${optionsSourceType}, ${attributeEnumeration}]`;
            case "boolean":
                return `[${controlType} ${optionsSourceType}, ${attributeBoolean}]`;
            default:
                return emptyStringFormat;
        }
    } else if (source === "database" && optionsSourceDatabaseDataSource) {
        return (
            (optionsSourceDatabaseDataSource as { caption?: string })?.caption ||
            `${source}, ${databaseAttributeString}`
        );
    } else if (source === "static") {
        return (optionsSourceStaticDataSource as { caption?: string })?.caption || `[${source}, ${staticAttribute}]`;
    }
    return emptyStringFormat;
}

export function getValidationErrorId(inputId?: string): string | undefined {
    return inputId ? inputId + "-validation-message" : undefined;
}

export function getInputLabel(inputId: string): Element | null {
    return document.querySelector(`label[for="${inputId}"]`);
}
