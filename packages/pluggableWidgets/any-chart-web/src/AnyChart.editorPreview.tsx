import { ReactElement, createElement } from "react";
import { AnyChartPreviewProps } from "../typings/AnyChartProps";
import AnyChart from "./AnyChart";

const defaultSampleData = `[{
    "type": "scatter",
    "x": [1, 2, 3, 4, 5, 6, 7, 8],
    "y": [5, 35, 15, 45, 25, 65, 30, 55],
    "mode": "lines+markers",
    "marker": { 
        "color": "#264AE5",
        "size": 8
    },
    "line": {
        "width": 2
    }
}]`;

const defaultSampleLayout = `{
    "showlegend": false,
    "margin": { "t": 40, "r": 10, "l": 40, "b": 40 },
    "xaxis": {
        "showgrid": true,
        "zeroline": true,
        "showline": true,
        "title": "X Axis"
    },
    "yaxis": {
        "showgrid": true,
        "zeroline": true,
        "showline": true,
        "title": "Y Axis"
    }
}`;

const defaultConfig = `{
    "displayModeBar": false,
    "staticPlot": true
}`;

export function preview(props: AnyChartPreviewProps): ReactElement {
    const containerProps = {
        name: "preview-chart",
        class: props.class,
        style: props.styleObject,
        tabIndex: 0,
        dataStatic: props.dataStatic || defaultSampleData,
        sampleData: props.sampleData,
        devMode: props.devMode,
        layoutStatic: props.layoutStatic || defaultSampleLayout,
        sampleLayout: props.sampleLayout,
        configurationOptions: props.configurationOptions || defaultConfig,
        widthUnit: props.widthUnit,
        width: props.width || 100,
        heightUnit: props.heightUnit,
        height: props.height || 75
    };

    return <AnyChart {...containerProps} />;
}
