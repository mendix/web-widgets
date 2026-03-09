export type EditorBuild = {
    entry: string;
    outputFile: string;
    externals: Array<string | RegExp>;
    format?: "cjs" | "es";
};

export type RuntimeOutput = {
    format: "cjs" | "es" | "amd";
    entryFileName: string;
};

export type FileCopy = {
    src: string;
    dest: string;
};

export type WidgetPackageJson = {
    name: string;
    widgetName?: string;
    version: string;
    packagePath: string;
    mxpackage?: {
        mpkName?: string;
    };
};

export type WidgetViteConfigOptions = {
    widgetName?: string;
    runtimeDirectoryName?: string;
};

export type ResolvedConfig = {
    widgetName: string;
    widgetVersion: string;
    mpkName: string;
    runtimeEntry: string;
    runtimeOutDir: string;
    runtimeOutputs: RuntimeOutput[];
    runtimeExternals: Array<string | RegExp>;
    metadataFiles: FileCopy[];
    editorBuilds: EditorBuild[];
    requiredArtifacts: string[];
    removeBeforeCopy: string[];
    define: Record<string, string>;
};
