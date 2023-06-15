const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const name = "signature";
const widgetName = "Signature";

const widgetConfig = {
    mode: "production",
    devtool: false,
    externals: ["react", "react-dom"],
    entry: "./src/components/SignatureContainer.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: `com/mendix/widget/custom/${name}/${widgetName}.js`,
        libraryTarget: "amd",
        publicPath: "/widgets/"
    },
    resolve: {
        extensions: [".ts", ".js", ".tsx", ".jsx"],
        alias: {
            tests: path.resolve(__dirname, "./tests")
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader"
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: `com/mendix/widget/custom/${name}/ui/${widgetName}.css`
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(process.cwd(), "src/**/*.xml").replace(/\\/g, "/"),
                    toType: "template",
                    to: "./[name][ext]"
                },
                {
                    from: `src/${widgetName}.@(tile|icon)@(.dark|).png`,
                    to: "./[name][ext]",
                    toType: "template"
                }
            ]
        })
    ]
};

const previewConfig = {
    mode: "production",
    devtool: false,
    externals: ["react", "react-dom"],
    entry: `./src/${widgetName}.webmodeler.ts`,
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: `${widgetName}.webmodeler.js`,
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [".ts", ".js", ".tsx", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    compilerOptions: {
                        module: "CommonJS"
                    }
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: ["to-string-loader", "css-loader", "sass-loader"]
            }
        ]
    }
};

module.exports = [widgetConfig, previewConfig];
