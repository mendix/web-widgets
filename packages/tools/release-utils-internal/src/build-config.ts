import { join } from "node:path";
import { fgYellow } from "./ansi-colors";
// import { find } from "shelljs";

import { getWidgetPackageInfo, WidgetInfo, ModuleInfo, getModulePackageInfo } from "./package-info";

export interface Output<Dirs, Files> {
    dirs: Dirs;
    files: Files;
}

export interface BuildConfig<Paths, OutputDirs, OutputFiles> {
    name: string;
    dependencies: string[];
    paths: Paths;
    output: Output<OutputDirs, OutputFiles>;
}

export interface WidgetPaths {
    package: string;
    dist: string;
    tmp: string;
    targetProject: string;
}

export interface WidgetOutputFiles {
    mpk: string;
}

export interface WidgetOutputDirs {
    widgets: string;
}

export interface WidgetBuildConfig extends BuildConfig<WidgetPaths, WidgetOutputDirs, WidgetOutputFiles> {}

export interface ModulePaths extends WidgetPaths {
    themesource: string;
}

export interface ModuleOutputFiles {
    mpk: string;
    modulePackage: string;
}

export interface ModuleOutputDirs extends WidgetOutputDirs {
    themesource: string;
    javascriptsource: string;
}

export interface ModuleBuildConfig extends BuildConfig<ModulePaths, ModuleOutputDirs, ModuleOutputFiles> {}

type GetWidgetBuildConfigParams = {
    info: WidgetInfo;
    dependencies: string[];
    packagePath: string;
};

export async function getWidgetBuildConfig({
    info,
    packagePath,
    dependencies
}: GetWidgetBuildConfigParams): Promise<WidgetBuildConfig> {
    const MX_PROJECT_PATH = process.env.MX_PROJECT_PATH;
    const { version, appName, widgetName } = info;

    console.info(`Creating build config for ${appName}...`);

    if (MX_PROJECT_PATH) {
        console.warn(fgYellow(`targetProject: using project path from MX_PROJECT_PATH.`));
    }

    const paths = {
        package: packagePath,
        dist: join(packagePath, "dist"),
        tmp: join(packagePath, "dist/tmp"),
        targetProject: MX_PROJECT_PATH ? MX_PROJECT_PATH : join(packagePath, "tests/testProject")
    };

    const output = {
        dirs: {
            widgets: join(paths.targetProject, "widgets")
        },
        files: {
            mpk: join(paths.dist, version.format(), widgetName)
        }
    };

    const result = {
        name: info.packageName,
        dependencies,
        paths,
        output
    };

    return result;
}

type WidgetBuildConfigParams = {
    dependencies: string[];
    packagePath: string;
};

type WidgetBuildConfigResult = [WidgetInfo, WidgetBuildConfig];

export async function getWidgetConfigs({
    packagePath,
    dependencies
}: WidgetBuildConfigParams): Promise<WidgetBuildConfigResult> {
    const info = await getWidgetPackageInfo(packagePath);
    const config = await getWidgetBuildConfig({ packagePath, dependencies, info });

    return [info, config];
}

type GetModuleBuildConfigParams = {
    info: ModuleInfo;
    dependencies: string[];
    packagePath: string;
};

export async function getModuleBuildConfig({
    info,
    packagePath,
    dependencies
}: GetModuleBuildConfigParams): Promise<ModuleBuildConfig> {
    const MX_PROJECT_PATH = process.env.MX_PROJECT_PATH;
    const { version, appName, moduleNameInModeler, moduleFolderNameInModeler } = info;
    const mpkName = `${moduleNameInModeler}.mpk`;

    console.info(`Creating build config for ${appName}...`);

    if (MX_PROJECT_PATH) {
        console.warn(fgYellow(`targetProject: using project path from MX_PROJECT_PATH.`));
    }

    const paths = {
        package: packagePath,
        dist: join(packagePath, "dist"),
        tmp: join(packagePath, "dist/tmp"),
        targetProject: MX_PROJECT_PATH ? MX_PROJECT_PATH : join(packagePath, "tests/testProject"),
        themesource: join(packagePath, "src/themesource", moduleFolderNameInModeler)
    };

    const output = {
        dirs: {
            themesource: join(paths.themesource, "themesource", moduleFolderNameInModeler),
            javascriptsource: join(paths.targetProject, "javascriptsource", moduleFolderNameInModeler),
            widgets: join(paths.targetProject, "widgets")
        },
        files: {
            mpk: join(paths.dist, version.format(), mpkName),
            modulePackage: join(paths.targetProject, mpkName)
        }
    };

    const result = {
        name: info.packageName,
        dependencies,
        paths,
        output
    };

    return result;
}

type ModuleBuildConfigParams = {
    dependencies: string[];
    packagePath: string;
};
type ModuleBuildConfigsResult = [ModuleInfo, ModuleBuildConfig];

export async function getModuleConfigs({
    packagePath,
    dependencies
}: ModuleBuildConfigParams): Promise<ModuleBuildConfigsResult> {
    const info = await getModulePackageInfo(packagePath);
    const config = await getModuleBuildConfig({ packagePath, info, dependencies });

    return [info, config];
}
