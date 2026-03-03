import createWidgetViteConfig from "@mendix/vite-web-widgets/vite.config";

const widgetName = "Datagrid";
const useCjsRuntime = process.env.VITE_RUNTIME_FORMAT === "cjs";

export default createWidgetViteConfig({
    widgetName,
    widgetVersion: "3.8.1",
    mpkName: `com.mendix.widget.web.${widgetName}.mpk`,
    runtimeEntry: "src/Datagrid.tsx",
    runtimeOutDir: "dist/tmp/widgets/com/mendix/widget/web/datagrid",
    runtimeOutputs: [
        {
            format: useCjsRuntime ? "cjs" : "amd",
            entryFileName: `${widgetName}.js`
        },
        {
            format: "es",
            entryFileName: `${widgetName}.mjs`
        }
    ],
    runtimeExternals: ["react", "react-dom", "big.js", /^mendix($|\/)/],
    define: {
        "process.env.NODE_ENV": JSON.stringify("production")
    },
    editorBuilds: [
        {
            entry: "src/Datagrid.editorPreview.tsx",
            outputFile: "Datagrid.editorPreview.js",
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        },
        {
            entry: "src/Datagrid.editorConfig.ts",
            outputFile: "Datagrid.editorConfig.js",
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        }
    ],
    requiredArtifacts: [
        "Datagrid.editorConfig.js",
        "Datagrid.editorPreview.js",
        "com/mendix/widget/web/datagrid/Datagrid.js",
        "com/mendix/widget/web/datagrid/Datagrid.mjs"
    ],
    removeBeforeCopy: ["datagrid-web.css"],
    metadataFiles: [
        { src: "src/Datagrid.xml", dest: "Datagrid.xml" },
        { src: "src/Datagrid.icon.png", dest: "Datagrid.icon.png" },
        { src: "src/Datagrid.icon.dark.png", dest: "Datagrid.icon.dark.png" },
        { src: "src/Datagrid.tile.png", dest: "Datagrid.tile.png" },
        { src: "src/Datagrid.tile.dark.png", dest: "Datagrid.tile.dark.png" },
        { src: "../../../LICENSE", dest: "License.txt" },
        { src: "src/package.xml", dest: "package.xml" }
    ]
});
