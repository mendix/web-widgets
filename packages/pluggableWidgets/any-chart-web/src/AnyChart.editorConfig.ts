import { Properties } from "@mendix/pluggable-widgets-tools";
import { StructurePreviewProps } from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { AnyChartPreviewProps } from "../typings/AnyChartProps";

export function getProperties(_values: AnyChartPreviewProps, defaultProperties: Properties): Properties {
    return defaultProperties;
}

export function getPreview(_values: AnyChartPreviewProps, _isDarkMode: boolean): StructurePreviewProps {
    return {
        type: "Container",
        children: []
    };
}
