import { hidePropertyIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";
import { checkSlot, withPlaygroundSlot } from "@mendix/shared-charts/preview";
import {
    structurePreviewPalette,
    StructurePreviewProps
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { CustomChartPreviewProps } from "../typings/CustomChartProps";

export function getProperties(values: CustomChartPreviewProps, defaultProperties: Properties): Properties {
    if (values.showPlaygroundSlot === false) {
        hidePropertyIn(defaultProperties, values, "playground");
    }
    return defaultProperties;
}

export function getPreview(values: CustomChartPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const sampleChartSvg = `
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="80" height="80" rx="4" fill="${palette.background.container}" stroke="${palette.background.containerDisabled}" stroke-width="2"/>
            <path d="M20 70L35 55L50 60L65 40L80 30" stroke="${palette.text.primary}" stroke-width="2"/>
            <circle cx="20" cy="70" r="3" fill="${palette.text.primary}"/>
            <circle cx="35" cy="55" r="3" fill="${palette.text.primary}"/>
            <circle cx="50" cy="60" r="3" fill="${palette.text.primary}"/>
            <circle cx="65" cy="40" r="3" fill="${palette.text.primary}"/>
            <circle cx="80" cy="30" r="3" fill="${palette.text.primary}"/>
            <line x1="15" y1="80" x2="85" y2="80" stroke="${palette.background.containerDisabled}" stroke-width="2"/>
            <line x1="15" y1="80" x2="15" y2="20" stroke="${palette.background.containerDisabled}" stroke-width="2"/>
        </svg>
    `;

    const preview: StructurePreviewProps = {
        type: "Container",
        backgroundColor: palette.background.container,
        borders: true,
        borderRadius: 4,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [
                    {
                        type: "Text",
                        content: "Custom Chart",
                        fontColor: palette.text.primary,
                        fontSize: 10,
                        bold: true
                    }
                ]
            },
            {
                type: "Container",
                grow: 1,
                children: [
                    {
                        type: "Image",
                        document: decodeURIComponent(encodeURIComponent(sampleChartSvg)),
                        width: 100,
                        height: 100
                    }
                ]
            }
        ]
    };

    return withPlaygroundSlot(values, preview);
}

export function check(values: CustomChartPreviewProps): Problem[] {
    const errors: Array<Problem | Problem[]> = [];

    errors.push(checkSlot(values));

    return errors.flat();
}
