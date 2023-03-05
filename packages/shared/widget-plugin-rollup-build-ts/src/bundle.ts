import { existsSync } from "node:fs";
import { posix, resolve as resolvePath } from "node:path";
import type { Env } from "./context.js";
import type { PackageJsonFileContent } from "./pkg-utils.js";

export type Bundle = {
    widgetName: string;
    inputs: WidgetInputs;
    outputs: WidgetOutputs;
    mpk: WidgetMpk;
    dirs: WidgetDirs;
};

export function bundle(env: Env, pkg: PackageJsonFileContent, outDir: string): Bundle {
    const name = pkg.mxpackage.name;

    const dirs = widgetDirs(outDir, pkg.version, publicPath(pkg.packagePath, name));

    const inputs = widgetInputs(name);

    const outputs = widgetOutputs(name, dirs);

    const mpk = widgetMpk(env, pkg, dirs);

    return {
        widgetName: name,
        inputs: {
            ...inputs,
            editorConfig: existsSync(inputs.editorConfig) ? inputs.editorConfig : undefined,
            editorPreview: existsSync(inputs.editorPreview) ? inputs.editorPreview : undefined
        },
        outputs,
        dirs,
        mpk
    };
}

export type WidgetDirs = {
    clientModule: {
        rootDir: RelDirPath;
        widgetDefinitionDir: RelDirPath;
        clientComponentDir: RelDirPath;
    };
    tmpDir: RelDirPath;
    mpkDir: RelDirPath;
};

function widgetDirs(outDir: string, version: string, publicPath: string): WidgetDirs {
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

export type WidgetInputs = {
    main: RelFilePath;
    editorConfig?: RelFilePath;
    editorPreview?: RelFilePath;
    widgetDefinition: RelFilePath;
    icons: Glob;
};

function widgetInputs(name: string): Required<WidgetInputs> {
    return {
        main: `src/${name}.tsx`,
        editorConfig: `src/${name}.editorConfig.ts`,
        editorPreview: `src/${name}.editorPreview.tsx`,
        widgetDefinition: `src/${name}.xml`,
        icons: `src/*.{icon,tile}*.png`
    };
}

export type WidgetOutputs = {
    mainEsm: string;
    mainAmd: string;
    editorConfig: string;
    editorPreview: string;
};

function widgetOutputs(name: string, { clientModule }: WidgetDirs): WidgetOutputs {
    return {
        mainAmd: posix.join(clientModule.clientComponentDir, `${name}.js`),
        mainEsm: posix.join(clientModule.clientComponentDir, `${name}.mjs`),
        editorConfig: posix.join(clientModule.widgetDefinitionDir, `${name}.editorConfig.js`),
        editorPreview: posix.join(clientModule.widgetDefinitionDir, `${name}.editorPreview.js`)
    };
}

export type WidgetMpk = {
    mpkName: string;
    mpkFileAbsolute: string;
};

function widgetMpk(env: Env, pkg: PackageJsonFileContent, dirs: WidgetDirs): WidgetMpk {
    const mpkName = env.mpkoutput ?? pkg.mxpackage.mpkName;

    return {
        mpkName,
        mpkFileAbsolute: resolvePath(dirs.mpkDir, mpkName)
    };
}

type RelDirPath = string;

type RelFilePath = string;

type Glob = string;
