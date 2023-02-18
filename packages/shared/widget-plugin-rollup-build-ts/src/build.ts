import { existsSync } from "node:fs";
import { posix } from "node:path";
import { getPackageFileContentSync, PackageJsonFileContent } from "./pkg-utils.js";

const join = (...args: string[]): string => posix.join(...args);

type RelDirPath = string;

type RelFilePath = string;

type Glob = string;

export type DirMap = {
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

export type BuildConfig = {
    name: string;
    package: PackageJsonFileContent;
    inputs: WidgetInputs;
    outputs: WidgetOutputs;
    dirs: DirMap;
};

export function widgetInputs(name: string): Required<WidgetInputs> {
    return {
        main: `src/${name}.tsx`,
        editorConfig: `src/${name}.editorConfig.ts`,
        editorPreview: `src/${name}.editorPreview.tsx`,
        widgetDefinition: `src/${name}.xml`,
        icons: `src/*.{icon,tile}*.png`
    };
}

export function publicPath(namespace: string, packageName: string): string {
    const pkgNamespace = namespace.replace(/\./g, "/");
    const pkgDir = packageName.toLocaleLowerCase();

    return `${pkgNamespace}/${pkgDir}`;
}

export function createDirs(outDir: string, version: string, publicPath: string): DirMap {
    const tmpDir = join(outDir, "tmp");
    const moduleRootDir = join(outDir, "tmp", "widgets");
    const mpkDir = join(outDir, version);
    return {
        clientModule: {
            rootDir: moduleRootDir,
            widgetDefinitionDir: join(outDir, "tmp", "widgets"),
            clientComponentDir: join(moduleRootDir, publicPath)
        },
        tmpDir,
        mpkDir
    };
}

export function createBuildConfig(rootDir: string, outDir: string): BuildConfig {
    const pkg = getPackageFileContentSync(rootDir);

    const name = pkg.mxpackage.name;

    const dirs = createDirs(outDir, pkg.version, publicPath(pkg.packagePath, name));

    const inputs = widgetInputs(name);

    return {
        name: name,
        package: pkg,
        inputs: {
            ...inputs,
            editorConfig: existsSync(inputs.editorConfig) ? inputs.editorConfig : undefined,
            editorPreview: existsSync(inputs.editorPreview) ? inputs.editorPreview : undefined
        },
        outputs: {
            mainAmd: join(dirs.clientModule.clientComponentDir, `${name}.js`),
            mainEsm: join(dirs.clientModule.clientComponentDir, `${name}.mjs`),
            editorConfig: join(dirs.clientModule.widgetDefinitionDir, `${name}.editorConfig.js`),
            editorPreview: join(dirs.clientModule.widgetDefinitionDir, `${name}.editorPreview.js`)
        },
        dirs
    };
}
