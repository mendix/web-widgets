import { join } from "node:path";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default args => {
    let result = args.configDefaultConfig;

    result.forEach(config => {
        config.external = [...config.external, "react-plotly.js"];

        config.output.paths = {
            ...config.output.paths,
            "react-plotly.js": "../../../shared/react-plotly.js"
        };
    });

    const reactPlotly = {
        input: "react-plotly.js",
        output: {
            format: "es",
            file: join("dist", "tmp", "widgets", "com", "mendix", "shared", "react-plotly.js")
        },
        plugins: [nodeResolve(), commonjs()]
    };

    result = [reactPlotly, ...result];

    return result;
};
