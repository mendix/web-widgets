import createWidgetViteConfig from "@mendix/vite-web-widgets/vite.config";

const widgetName = "Badge";

export default createWidgetViteConfig({
    widgetName,
    widgetVersion: "3.2.3",
    mpkName: "Badge.mpk",
    runtimeEntry: "src/Badge.tsx",
    runtimeOutDir: "dist/tmp/widgets/com/mendix/widget/custom/badge",
    runtimeOutputs: [
        {
            format: "cjs",
            entryFileName: `${widgetName}.js`
        },
        {
            format: "es",
            entryFileName: `${widgetName}.mjs`
        }
    ],
    runtimeExternals: ["react", "react-dom", "@mendix/widget-plugin-component-kit"],
    editorBuilds: [
        {
            entry: "src/Badge.editorPreview.tsx",
            outputFile: "Badge.editorPreview.js",
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        },
        {
            entry: "src/Badge.editorConfig.ts",
            outputFile: "Badge.editorConfig.js",
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        }
    ],
    requiredArtifacts: [
        "Badge.editorConfig.js",
        "Badge.editorPreview.js",
        "com/mendix/widget/custom/badge/Badge.js",
        "com/mendix/widget/custom/badge/Badge.mjs"
    ],
    metadataFiles: [
        { src: "src/Badge.xml", dest: "Badge.xml" },
        { src: "src/Badge.icon.png", dest: "Badge.icon.png" },
        { src: "src/Badge.icon.dark.png", dest: "Badge.icon.dark.png" },
        { src: "src/Badge.tile.png", dest: "Badge.tile.png" },
        { src: "src/Badge.tile.dark.png", dest: "Badge.tile.dark.png" },
        { src: "../../../LICENSE", dest: "License.txt" },
        { src: "src/package.xml", dest: "package.xml" }
    ]
});
