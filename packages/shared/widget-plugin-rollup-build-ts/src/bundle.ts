import { existsSync } from "node:fs";
import { posix } from "node:path";
import type { PackageJsonFileContent } from "./pkg-utils.js";

type RelDirPath = string;

type RelFilePath = string;

type Glob = string;

export type WidgetDirs = {
    clientModule: {
        rootDir: RelDirPath;
        widgetDefinitionDir: RelDirPath;
        clientComponentDir: RelDirPath;
    };
    tmpDir: RelDirPath;
    mpkDir: RelDirPath;
};

export type WidgetInputs = {
    main: RelFilePath;
    editorConfig?: RelFilePath;
    editorPreview?: RelFilePath;
    widgetDefinition: RelFilePath;
    icons: Glob;
};

export type WidgetOutputs = {
    mainEsm: string;
    mainAmd: string;
    editorConfig: string;
    editorPreview: string;
};

export type Bundle = {
    widgetName: string;
    inputs: WidgetInputs;
    outputs: WidgetOutputs;
    dirs: WidgetDirs;
};

export function createBundle(pkg: PackageJsonFileContent, outDir: string): Bundle {
    const name = pkg.mxpackage.name;

    const dirs = createDirs(outDir, pkg.version, publicPath(pkg.packagePath, name));

    const inputs = widgetInputs(name);

    const outputs = widgetOutputs(name, dirs);

    return {
        widgetName: name,
        inputs: {
            ...inputs,
            editorConfig: existsSync(inputs.editorConfig) ? inputs.editorConfig : undefined,
            editorPreview: existsSync(inputs.editorPreview) ? inputs.editorPreview : undefined
        },
        outputs,
        dirs
    };
}

function createDirs(outDir: string, version: string, publicPath: string): WidgetDirs {
    const tmpDir = posix.join(outDir, "tmp");
    const moduleRootDir = posix.join(outDir, "tmp", "widgets");
    const mpkDir = posix.join(outDir, version);
    return {
        clientModule: {
            rootDir: moduleRootDir,
            widgetDefinitionDir: posix.join(outDir, "tmp", "widgets"),
            clientComponentDir: posix.join(moduleRootDir, publicPath)
        },
        tmpDir,
        mpkDir
    };
}

function publicPath(namespace: string, packageName: string): string {
    const pkgNamespace = namespace.replace(/\./g, "/");
    const pkgDir = packageName.toLocaleLowerCase();

    return `${pkgNamespace}/${pkgDir}`;
}

function widgetInputs(name: string): Required<WidgetInputs> {
    return {
        main: `src/${name}.tsx`,
        editorConfig: `src/${name}.editorConfig.ts`,
        editorPreview: `src/${name}.editorPreview.tsx`,
        widgetDefinition: `src/${name}.xml`,
        icons: `src/*.{icon,tile}*.png`
    };
}

function widgetOutputs(name: string, { clientModule }: WidgetDirs): WidgetOutputs {
    return {
        mainAmd: posix.join(clientModule.clientComponentDir, `${name}.js`),
        mainEsm: posix.join(clientModule.clientComponentDir, `${name}.mjs`),
        editorConfig: posix.join(clientModule.widgetDefinitionDir, `${name}.editorConfig.js`),
        editorPreview: posix.join(clientModule.widgetDefinitionDir, `${name}.editorPreview.js`)
    };
}
