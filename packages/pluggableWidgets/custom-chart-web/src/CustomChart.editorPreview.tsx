import { ReactElement, createElement } from "react";
import { CustomChartPreviewProps } from "../typings/CustomChartProps";
import CustomChart from "./CustomChart";

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

export function preview(props: CustomChartPreviewProps): ReactElement {
    const { renderer: PlaygroundSlot } = props.playground ?? { renderer: () => null };

    const containerProps = {
        name: "preview-custom-chart",
        class: props.class,
        style: props.styleObject,
        tabIndex: 0,
        dataStatic: props.dataStatic || defaultSampleData,
        sampleData: props.sampleData,
        showPlaygroundSlot: props.showPlaygroundSlot,
        layoutStatic: props.layoutStatic || defaultSampleLayout,
        sampleLayout: props.sampleLayout,
        configurationOptions: props.configurationOptions || defaultConfig,
        widthUnit: props.widthUnit,
        width: props.width || 75,
        heightUnit: props.heightUnit,
        height: props.height || 75
    };

    return (
        <div style={{ display: "flex", flexFlow: "column nowrap" }}>
            <div
                style={
                    props.showPlaygroundSlot
                        ? undefined
                        : {
                              display: "none"
                          }
                }
            >
                <PlaygroundSlot caption="Playground slot">{dropzone()}</PlaygroundSlot>
            </div>
            <CustomChart {...containerProps} />
        </div>
    );
}

// Preview don't support React component as children. So we forced to use plain function.
const dropzone = (): React.ReactNode => (
    <div style={{ padding: "10px 10px 10px 0", display: "flex", justifyContent: "end", flexGrow: 1, height: 58 }} />
);
