import { ColumnChartPreviewProps, BarmodeEnum } from "../typings/ColumnChartProps";
import {
    StructurePreviewProps,
    ImageProps,
    ContainerProps,
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

import ColumnChartGroupedDark from "./assets/ColumnChart-grouped.dark.svg";
import ColumnChartGroupedLight from "./assets/ColumnChart-grouped.light.svg";
import ColumnChartStackedDark from "./assets/ColumnChart-stacked.dark.svg";
import ColumnChartStackedLight from "./assets/ColumnChart-stacked.light.svg";
import ColumnChartLegendDark from "./assets/ColumnChart-legend.dark.svg";
import ColumnChartLegendLight from "./assets/ColumnChart-legend.light.svg";

export function getProperties(
    values: ColumnChartPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    if (values.showPlaygroundSlot === false) {
        hidePropertyIn(defaultProperties, values, "playground");
    }

    values.series.forEach((dataSeries, index) => {
        if (dataSeries.dataSet === "static") {
            hideNestedPropertiesIn(defaultProperties, values, "series", index, [
                "dynamicDataSource",
                "dynamicXAttribute",
                "dynamicYAttribute",
                "dynamicName",
                "dynamicTooltipHoverText",
                "groupByAttribute",
                "dynamicBarColor"
            ]);
        } else {
            hideNestedPropertiesIn(defaultProperties, values, "series", index, [
                "staticDataSource",
                "staticXAttribute",
                "staticYAttribute",
                "staticName",
                "staticTooltipHoverText",
                "staticBarColor"
            ]);
        }

        if (!values.advancedOptions && platform === "web") {
            hidePropertyIn(defaultProperties, values, "series", index, "customSeriesOptions");
        }
    });

    if (platform === "web") {
        if (!values.advancedOptions) {
            hidePropertiesIn(defaultProperties, values, ["customLayout", "customConfigurations", "enableThemeConfig"]);
        }

        transformGroupsIntoTabs(defaultProperties);
    } else {
        hidePropertiesIn(defaultProperties, values, ["advancedOptions"]);
    }

    return defaultProperties;
}

export function getPreview(values: ColumnChartPreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    const items = {
        group: {
            dark: { structure: ColumnChartGroupedDark, legend: ColumnChartLegendDark },
            light: { structure: ColumnChartGroupedLight, legend: ColumnChartLegendLight }
        },
        stack: {
            dark: { structure: ColumnChartStackedDark, legend: ColumnChartLegendDark },
            light: { structure: ColumnChartStackedLight, legend: ColumnChartLegendLight }
        }
    };

    const getImage = (barMode: BarmodeEnum, type: "structure" | "legend"): string => {
        const colorMode = isDarkMode ? "dark" : "light";
        return items[barMode][colorMode][type];
    };

    const chartImage = {
        type: "Image",
        document: decodeURIComponent(getImage(values.barmode, "structure").replace("data:image/svg+xml,", "")),
        width: 375
    } as ImageProps;

    const legendImage = {
        type: "Image",
        document: decodeURIComponent(getImage(values.barmode, "legend").replace("data:image/svg+xml,", "")),
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

export function check(values: ColumnChartPreviewProps): Problem[] {
    const errors: Array<Problem[] | Problem> = [];

    errors.push(checkSlot(values));

    values.series.forEach((dataSeries, index) => {
        if (dataSeries.dataSet === "static" && dataSeries.staticDataSource) {
            if (!dataSeries.staticXAttribute) {
                errors.push({
                    property: `series/${index + 1}/staticXAttribute`,
                    message: `Setting a X axis attribute is required.`
                });
            }
            if (!dataSeries.staticYAttribute) {
                errors.push({
                    property: `series/${index + 1}/staticYAttribute`,
                    message: `Setting a Y axis attribute is required.`
                });
            }
        }

        if (dataSeries.dataSet === "dynamic" && dataSeries.dynamicDataSource) {
            if (!dataSeries.dynamicXAttribute) {
                errors.push({
                    property: `series/${index + 1}/dynamicXAttribute`,
                    message: `Setting a X axis attribute is required.`
                });
            }

            if (!dataSeries.dynamicYAttribute) {
                errors.push({
                    property: `series/${index + 1}/dynamicYAttribute`,
                    message: `Setting a Y axis attribute is required.`
                });
            }
        }
    });

    return errors.flat();
}

export function getCustomCaption(values: ColumnChartPreviewProps): string {
    type DsProperty = { caption?: string };

    if (values.series.length === 0) {
        return "Column chart";
    }

    const serie = values.series[0];
    const ds = serie.dataSet === "dynamic" ? serie.dynamicDataSource : serie.staticDataSource;
    const dsProperty: DsProperty = datasource(ds)().property ?? {};
    const caption = dsProperty.caption?.replace("[", "").replace("]", "") || "";

    if (values.series.length > 1) {
        return `${caption} and ${values.series.length - 1} more`;
    }

    return caption;
}
