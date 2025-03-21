import {
    StructurePreviewProps,
    ImageProps,
    ContainerProps,
    datasource
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { checkSlot, withPlaygroundSlot } from "@mendix/shared-charts/preview";

import {
    hidePropertiesIn,
    hidePropertyIn,
    moveProperty,
    Properties,
    transformGroupsIntoTabs,
    Problem
} from "@mendix/pluggable-widgets-tools";

import { HeatMapPreviewProps } from "../typings/HeatMapProps";

import HeatMapDark from "./assets/HeatMap.dark.svg";
import HeatMapLight from "./assets/HeatMap.light.svg";
import HeatMapLegendDark from "./assets/HeatMap-legend.dark.svg";
import HeatMapLegendLight from "./assets/HeatMap-legend.light.svg";

function removeEmptyGroups(props: Properties): Properties {
    return props.filter(p => (p.properties?.length ?? 0) > 0 || (p.propertyGroups?.length ?? 0) > 0);
}
function moveVisibility(props: Properties): Properties {
    moveProperty(7, 4, props);
    return props;
}

function hideScaleControls(props: Properties, values: HeatMapPreviewProps): void {
    const { showScale, showValues, enableAdvancedOptions } = values;
    const controls: Array<[keyof HeatMapPreviewProps, boolean]> = [
        ["scaleColors", showScale],
        ["smoothColor", showScale && enableAdvancedOptions],
        ["showValues", showScale && enableAdvancedOptions],
        ["valuesColor", showScale && enableAdvancedOptions && showValues]
    ];

    const propsToHide = controls.map(([key, visible]) => (!visible ? [key] : [])).flat();

    hidePropertiesIn(props, values, propsToHide);
}

export function getProperties(
    values: HeatMapPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    if (values.showPlaygroundSlot === false) {
        hidePropertyIn(defaultProperties, values, "playground");
    }

    if (platform === "web") {
        if (!values.enableAdvancedOptions) {
            hidePropertiesIn(defaultProperties, values, [
                "customLayout",
                "customConfigurations",
                "customSeriesOptions",
                "enableThemeConfig"
            ]);
        }

        hideScaleControls(defaultProperties, values);
        transformGroupsIntoTabs(defaultProperties);
        const clean = removeEmptyGroups(defaultProperties);
        moveVisibility(clean);
        return clean;
    } else {
        hidePropertiesIn(defaultProperties, values, ["enableAdvancedOptions"]);
    }

    return defaultProperties;
}

export function getPreview(values: HeatMapPreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    const items = {
        dark: { structure: HeatMapDark, legend: HeatMapLegendDark },
        light: { structure: HeatMapLight, legend: HeatMapLegendLight }
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
        width: 57
    } as ImageProps;

    const filler = {
        type: "Container",
        grow: 1,
        children: []
    } as ContainerProps;

    const chart: StructurePreviewProps = {
        type: "RowLayout",
        columnSize: "fixed",
        children: values.showScale ? [chartImage, legendImage, filler] : [chartImage, filler]
    };

    return withPlaygroundSlot(values, chart);
}

export function getCustomCaption(values: HeatMapPreviewProps): string {
    type DsProperty = { caption?: string };
    const dsProperty: DsProperty = datasource(values.seriesDataSource)().property ?? {};
    return dsProperty.caption || "Heatmap chart";
}

export function check(props: HeatMapPreviewProps): Problem[] {
    const errors: Array<Problem[] | Problem> = [];

    errors.push(checkSlot(props));

    return errors.flat();
}
