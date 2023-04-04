import { Config, Layout } from "plotly.js";

export const configs: SharedConfigs = {
    layout: {
        font: {
            family: "Open Sans",
            size: 14,
            color: "#555"
        },
        autosize: true,
        hovermode: "closest",
        hoverlabel: {
            bgcolor: "#888",
            bordercolor: "#888",
            font: {
                color: "#FFF"
            }
        },
        margin: {
            l: 60,
            r: 60,
            b: 60,
            t: 60,
            pad: 10
        }
    },
    configuration: { displayModeBar: false, doubleClick: false }
};

interface SharedConfigs {
    layout: Partial<Layout>;
    configuration: Partial<Config>;
}
