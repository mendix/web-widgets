const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const widgetConfig = {
    mode: "production",
    entry: {
        AnyChart: "./src/AnyChart/components/AnyChartContainer.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "com/mendix/widget/custom/[name]/[name].js",
        chunkFilename: `com/mendix/widget/custom/AnyChart/chunk[chunkhash].js`,
        libraryTarget: "umd",
        publicPath: "widgets/"
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            tests: path.resolve(__dirname, "./tests"),
            "plotly.js/dist/plotly": "plotly.js/dist/plotly.min.js"
        }
    },
    devtool: false,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            }
        ]
    },
    externals: ["react", "react-dom"],
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/AnyChart/AnyChart.xml", to: "./AnyChart/" },
                { from: "src/AnyChart/package.xml", to: "./" },
                {
                    from: "src/AnyChart/AnyChart.@(tile|icon)@(.dark|).png",
                    to: "./AnyChart/[name][ext]",
                    toType: "template"
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: `./com/mendix/widget/custom/[name]/ui/[name].css`
        }),
        new webpack.LoaderOptionsPlugin({ debug: true }),
        new webpack.IgnorePlugin({
            resourceRegExp:
                /^plotly\.js\/lib\/core$|^plotly\.js\/lib\/pie$|^plotly\.js\/lib\/bar$|^plotly\.js\/lib\/scatter$|^plotly\.js\/lib\/heatmap$/
        })
    ]
};

const previewConfig = {
    mode: "development",
    entry: {
        AnyChart: "./src/AnyChart/AnyChart.webmodeler.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "AnyChart/[name].webmodeler.js",
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "plotly.js/dist/plotly": "plotly.js/dist/plotly.min.js"
        }
    },
    devtool: false,
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                options: {
                    configFile: "tsconfig.preview.json"
                }
            },
            { test: /\.css$/, use: "raw-loader" },
            {
                test: /\.scss$/,
                use: [{ loader: "raw-loader" }, { loader: "sass-loader" }]
            }
        ]
    },
    externals: ["react", "react-dom"],
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp:
                /^plotly\.js\/lib\/core$|^plotly\.js\/lib\/pie$|^plotly\.js\/lib\/bar$|^plotly\.js\/lib\/scatter$|^plotly\.js\/lib\/heatmap$/
        })
    ]
};

module.exports = [widgetConfig, previewConfig];
