import { existsSync } from "node:fs";
import { posix, resolve as resolvePath } from "node:path";
import type { Env } from "./context.js";
import type { PackageJsonFileContent } from "./pkg-utils.js";

export type Bundle = {
    widgetName: string;
    urlPaths: WidgetUrlPaths;
    inputs: WidgetInputs;
    outputs: WidgetOutputs;
    mpk: WidgetMpk;
    dirs: WidgetDirs;
};

export function bundle(env: Env, pkg: PackageJsonFileContent, outDir: string): Bundle {
    const name = pkg.mxpackage.name;

    const publicRoot = "widgets";

    const assetsDirName = "assets";

    const urlPaths = widgetUrlPaths(name, pkg.packagePath, publicRoot, assetsDirName);

    const dirs = widgetDirs(outDir, pkg.version, urlPaths.componentPath, assetsDirName);

    const inputs = widgetInputs(name);

    const outputs = widgetOutputs(name, dirs);

    const mpk = widgetMpk(env, pkg, dirs);

    return {
        widgetName: name,
        urlPaths,
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
        assetsDir: RelDirPath;
    };
    tmpDir: RelDirPath;
    mpkDir: RelDirPath;
};

function widgetDirs(outDir: string, version: string, publicPath: string, assetsDirName: string): WidgetDirs {
    const tmpDir = posix.join(outDir, "tmp");
    const moduleRootDir = posix.join(outDir, "tmp", "widgets");
    const mpkDir = posix.join(outDir, version);
    const widgetDefinitionDir = posix.join(outDir, "tmp", "widgets");
    const clientComponentDir = posix.join(moduleRootDir, publicPath);
    const assetsDir = posix.join(clientComponentDir, assetsDirName);

    return {
        clientModule: {
            rootDir: moduleRootDir,
            widgetDefinitionDir,
            clientComponentDir,
            assetsDir
        },
        tmpDir,
        mpkDir
    };
}

function componentPath(namespace: string, packageName: string): string {
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
    widgetCss: string;
};

function widgetOutputs(name: string, { clientModule }: WidgetDirs): WidgetOutputs {
    return {
        mainAmd: posix.join(clientModule.clientComponentDir, `${name}.js`),
        mainEsm: posix.join(clientModule.clientComponentDir, `${name}.mjs`),
        widgetCss: posix.join(clientModule.assetsDir, `${name}.css`),
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

type WidgetUrlPaths = {
    publicRoot: string;
    publicPath: string;
    componentPath: string;
    assetsDirName: string;
    assetsPublicPath: string;
    assetsPathRelativeToWidgetsDotCSS: string;
};

function widgetUrlPaths(name: string, packagePath: string, publicRoot: string, assetsDirName: string): WidgetUrlPaths {
    const widgetComponentPath = componentPath(packagePath, name);

    const widgetAssetsPath = `${widgetComponentPath}/${assetsDirName}`;

    const publicPath = `${publicRoot}/${widgetComponentPath}`;

    const assetsPublicPath = `${publicRoot}/${widgetAssetsPath}`;

    const assetsPathRelativeToWidgetsDotCSS = widgetAssetsPath;

    return {
        publicRoot,
        publicPath,
        componentPath: widgetComponentPath,
        assetsDirName,
        assetsPublicPath,
        assetsPathRelativeToWidgetsDotCSS
    };
}

type RelDirPath = string;

type RelFilePath = string;

type Glob = string;
