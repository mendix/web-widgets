import {
    ContainerProps,
    ImageProps,
    StructurePreviewProps,
    datasource
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { checkSlot, withPlaygroundSlot } from "@mendix/shared-charts/preview";
import {
    hideNestedPropertiesIn,
    hidePropertiesIn,
    hidePropertyIn,
    Problem,
    Properties,
    transformGroupsIntoTabs
} from "@mendix/pluggable-widgets-tools";

import { BubbleChartPreviewProps } from "../typings/BubbleChartProps";

import BubbleChartLightSvg from "./assets/BubbleChart.light.svg";
import BubbleChartDarkSvg from "./assets/BubbleChart.dark.svg";
import BubbleChartLegendLightSvg from "./assets/BubbleChart-legend.light.svg";
import BubbleChartLegendDarkSvg from "./assets/BubbleChart-legend.dark.svg";

export function getProperties(
    values: BubbleChartPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    if (values.showPlaygroundSlot === false) {
        hidePropertyIn(defaultProperties, values, "playground");
    }

    values.lines.forEach((line, index) => {
        // Series properties
        if (line.dataSet === "static") {
            hideNestedPropertiesIn(defaultProperties, values, "lines", index, [
                "dynamicDataSource",
                "dynamicXAttribute",
                "dynamicYAttribute",
                "dynamicSizeAttribute",
                "dynamicName",
                "dynamicTooltipHoverText",
                "groupByAttribute",
                "dynamicMarkerColor"
            ]);
        } else {
            hideNestedPropertiesIn(defaultProperties, values, "lines", index, [
                "staticDataSource",
                "staticXAttribute",
                "staticYAttribute",
                "staticSizeAttribute",
                "staticName",
                "staticTooltipHoverText",
                "staticMarkerColor"
            ]);
        }
        if (!values.enableAdvancedOptions && platform === "web") {
            hidePropertyIn(defaultProperties, values, "lines", index, "customSeriesOptions");
        }
        if (line.autosize) {
            hidePropertyIn(defaultProperties, values, "lines", index, "sizeref");
        }
    });

    if (platform === "web") {
        if (!values.enableAdvancedOptions) {
            hidePropertiesIn(defaultProperties, values, ["customLayout", "customConfigurations", "enableThemeConfig"]);
        }

        transformGroupsIntoTabs(defaultProperties);
    } else {
        hidePropertyIn(defaultProperties, values, "enableAdvancedOptions");
    }
    return defaultProperties;
}

export function getPreview(values: BubbleChartPreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    const items = {
        dark: { structure: BubbleChartDarkSvg, legend: BubbleChartLegendDarkSvg },
        light: { structure: BubbleChartLightSvg, legend: BubbleChartLegendLightSvg }
    };

    const getImage = (type: "structure" | "legend"): string => {
        const colorMode = isDarkMode ? "dark" : "light";
        return items[colorMode][type];
    };

    const chartImage = {
        type: "Image",
        document: decodeURIComponent(getImage("structure").replace("data:image/svg+xml,", "")),
        width: 375
    } as ImageProps;

    const legendImage = {
        type: "Image",
        document: decodeURIComponent(getImage("legend").replace("data:image/svg+xml,", "")),
        width: 85
    } as ImageProps;

    const filler = {
        type: "Container",
        grow: 1,
        children: []
    } as ContainerProps;

    const chart: StructurePreviewProps = {
        type: "RowLayout",
        columnSize: "fixed",
        children: values.showLegend ? [chartImage, legendImage, filler] : [chartImage, filler]
    };

    return withPlaygroundSlot(values, chart);
}

export function check(values: BubbleChartPreviewProps): Problem[] {
    const errors: Array<Problem[] | Problem> = [];

    errors.push(checkSlot(values));

    values.lines.forEach((line, index) => {
        if (line.dataSet === "static" && line.staticDataSource) {
            if (!line.staticXAttribute) {
                errors.push({
                    property: `lines/${index + 1}/staticXAttribute`,
                    message: `Setting a X axis attribute is required.`
                });
            }
            if (!line.staticYAttribute) {
                errors.push({
                    property: `lines/${index + 1}/staticYAttribute`,
                    message: `Setting a Y axis attribute is required.`
                });
            }
            if (!line.staticSizeAttribute) {
                errors.push({
                    property: `lines/${index + 1}/staticSizeAttribute`,
                    message: `Setting a size attribute is required.`
                });
            }
        }
        if (line.dataSet === "dynamic" && line.dynamicDataSource) {
            if (!line.dynamicXAttribute) {
                errors.push({
                    property: `lines/${index + 1}/dynamicXAttribute`,
                    message: `Setting a X axis attribute is required.`
                });
            }
            if (!line.dynamicYAttribute) {
                errors.push({
                    property: `lines/${index + 1}/dynamicYAttribute`,
                    message: `Setting a Y axis attribute is required.`
                });
            }
            if (!line.dynamicSizeAttribute) {
                errors.push({
                    property: `lines/${index + 1}/dynamicSizeAttribute`,
                    message: `Setting a size attribute is required.`
                });
            }
        }
    });
    return errors.flat();
}

export function getCustomCaption(values: BubbleChartPreviewProps): string {
    type DsProperty = { caption?: string };

    if (values.lines.length === 0) {
        return "Bubble chart";
    }

    const serie = values.lines[0];
    const ds = serie.dataSet === "dynamic" ? serie.dynamicDataSource : serie.staticDataSource;
    const dsProperty: DsProperty = datasource(ds)().property ?? {};
    const caption = dsProperty.caption?.replace("[", "").replace("]", "") || "";

    if (values.lines.length > 1) {
        return `${caption} and ${values.lines.length - 1} more`;
    }

    return caption;
}
