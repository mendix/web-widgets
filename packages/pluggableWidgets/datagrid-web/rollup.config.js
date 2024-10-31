module.exports = args => {
    const [widgetAMD, widgetESM, editorPreview, editorConfig] = args.configDefaultConfig;

    // By default "react/jsx-runtime" is marked as external.
    // We remove it from external array to make it a normal dependency for editorPreview file.
    editorPreview.external = [/^mendix($|\/)/, /^react$/, /^react-dom$/];

    return [widgetAMD, widgetESM, editorPreview, editorConfig];
};
