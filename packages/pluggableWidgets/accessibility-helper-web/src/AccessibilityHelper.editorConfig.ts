import {
    DropZoneProps,
    RowLayoutProps,
    structurePreviewPalette,
    StructurePreviewProps,
    TextProps
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { hidePropertyIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";
import { AccessibilityHelperPreviewProps, AttributesListPreviewType } from "../typings/AccessibilityHelperProps";

const PROHIBITED_ATTRIBUTES = ["class", "style", "widgetid", "data-mendix-id"];

export function getProperties(values: AccessibilityHelperPreviewProps, defaultProperties: Properties): Properties {
    values.attributesList.forEach((item: AttributesListPreviewType, index: number) => {
        if (item.valueSourceType === "text") {
            hidePropertyIn(defaultProperties, values, "attributesList", index, "valueExpression");
        }
        if (item.valueSourceType === "expression") {
            hidePropertyIn(defaultProperties, values, "attributesList", index, "valueText");
        }
    });
    return defaultProperties;
}

export function check(values: AccessibilityHelperPreviewProps): Problem[] {
    const errors: Problem[] = [];
    values.attributesList.forEach((item: AttributesListPreviewType, index) => {
        if (PROHIBITED_ATTRIBUTES.some(value => value === item.attribute)) {
            errors.push({
                property: `attributesList/${index + 1}/attribute`,
                message: `Widget tries to change ${item.attribute} attribute, this is prohibited`,
                url: "https://docs.mendix.com/appstore/widgets/accessibility-helper"
            });
        }
    });

    return errors;
}

export function getPreview(values: AccessibilityHelperPreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

    return {
        type: "Container",
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "RowLayout",
                backgroundColor: values.content.widgetCount > 0 ? undefined : palette.background.topbarStandard,
                children: [
                    {
                        type: "DropZone",
                        property: values.content,
                        placeholder: "Place content here"
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
                        padding: 8,
                        children: [
                            {
                                type: "Text",
                                bold: true,
                                content:
                                    values.targetSelector.length > 0
                                        ? `Target ${values.targetSelector}`
                                        : "Target [Target selector]"
                            } as TextProps
                        ]
                    }
                ]
            }
        ]
    };
}
