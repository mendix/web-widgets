import { Problem, Properties } from "@mendix/pluggable-widgets-tools";
import {
    StructurePreviewProps,
    RowLayoutProps,
    ContainerProps,
    TextProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";

export function getProperties(defaultValues: Properties): Properties {
    // No conditional properties for skiplink, but function provided for consistency
    return defaultValues;
}

export function check(values: any): Problem[] {
    const errors: Problem[] = [];
    if (!values.linkText) {
        errors.push({
            property: "linkText",
            message: "Link text is required"
        });
    }
    if (!values.mainContentId) {
        errors.push({
            property: "mainContentId",
            message: "Main content ID is required"
        });
    }
    return errors;
}

export function getPreview(values: any, isDarkMode: boolean): StructurePreviewProps | null {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const titleHeader: RowLayoutProps = {
        type: "RowLayout",
        columnSize: "grow",
        backgroundColor: palette.background.topbarStandard,
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [
                    {
                        type: "Text",
                        content: "SkipLink",
                        fontColor: palette.text.secondary
                    } as TextProps
                ]
            }
        ]
    };
    const linkContent: RowLayoutProps = {
        type: "RowLayout",
        columnSize: "grow",
        borders: true,
        padding: 0,
        children: [
            {
                type: "Container",
                padding: 6,
                children: [
                    {
                        type: "Text",
                        content: values.linkText || "Skip to main content",
                        fontSize: 14,
                        fontColor: palette.text.primary,
                        bold: true
                    } as TextProps
                ]
            }
        ]
    };
    return {
        type: "Container",
        borders: true,
        children: [titleHeader, linkContent]
    } as ContainerProps;
}
