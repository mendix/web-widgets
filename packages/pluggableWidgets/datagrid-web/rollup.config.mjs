import { withSharedLibs } from "@mendix/rollup-web-widgets/sharedLibs.mjs";

export default args => {
    const [widgetAMD, widgetESM, editorPreview, editorConfig] = args.configDefaultConfig;

    // By default "react/jsx-runtime" is marked as external.
    // We remove it from external array to make it a normal dependency for editorPreview file.
    editorPreview.external = [/^mendix($|\/)/, /^react$/, /^react-dom$/];

    return withSharedLibs(args, [widgetAMD, widgetESM, editorPreview, editorConfig]);
};
