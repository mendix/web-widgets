export default args => {
    const result = args.configDefaultConfig;
    // result.onwarn = (warning, warn) => {
    //     if (warning.code === "THIS_IS_UNDEFINED") return;
    //     warn(warning);
    // };
    // console.log("result", result);
    // return result.map(config => {
    //     config.plugins = [
    //         ...config.plugins,
    //         babel({
    //             babelHelpers: "bundled",
    //             babelrc: true,
    //             configFile: false
    //             // include: ["packages/pluggableWidgets/document-viewer-web/**"]
    //         })
    //     ];
    return result;
};
