module.exports = args => {
    const [widgetAMD, widgetESM, ...rest] = args.configDefaultConfig;

    widgetAMD.output.inlineDynamicImports = true;
    widgetESM.output.inlineDynamicImports = true;

    return [widgetAMD, widgetESM, ...rest];
};
