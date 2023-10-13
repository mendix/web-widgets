import { join } from "node:path";
import { fgGreen } from "./ansi-colors";
import { getModuleInfo, getWidgetInfo, ModuleInfo, WidgetInfo } from "./package-info";

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

export interface CommonPaths {
    package: string;
    dist: string;
    tmp: string;
    targetProject: string;
}

export interface CommonOutputFiles {
    mpk: string;
}

export interface CommonOutputDirs {
    widgets: string;
}

export interface CommonBuildConfig extends BuildConfig<CommonPaths, CommonOutputDirs, CommonOutputFiles> {}

export interface WidgetBuildConfig extends CommonBuildConfig {}

export interface ModulePaths extends CommonPaths {
    themesource: string;
    javascriptsource: string;
}

export interface ModuleOutputFiles {
    mpk: string;
    modulePackage: string;
}

export interface ModuleOutputDirs extends CommonOutputDirs {
    themesource: string;
    javascriptsource: string;
}

export interface ModuleBuildConfig extends BuildConfig<ModulePaths, ModuleOutputDirs, ModuleOutputFiles> {}

type GetWidgetBuildConfigParams = {
    info: WidgetInfo;
    packagePath: string;
};

export async function getWidgetBuildConfig({
    info,
    packagePath
}: GetWidgetBuildConfigParams): Promise<WidgetBuildConfig> {
    const MX_PROJECT_PATH = process.env.MX_PROJECT_PATH;
    const { name: packageName, version, mxpackage, mpkName } = info;

    console.info(`Creating build config for ${packageName}...`);

    if (MX_PROJECT_PATH) {
        console.info(fgGreen(`targetProject: using project path from MX_PROJECT_PATH.`));
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
            mpk: join(paths.dist, version.format(), mpkName)
        }
    };

    const result = {
        name: packageName,
        dependencies: mxpackage.dependencies,
        paths,
        output
    };

    return result;
}

type WidgetBuildConfigResult = [WidgetInfo, WidgetBuildConfig];

export async function getWidgetConfigs(packagePath: string): Promise<WidgetBuildConfigResult> {
    const info = await getWidgetInfo(packagePath);
    const config = await getWidgetBuildConfig({ packagePath, info });

    return [info, config];
}

type GetModuleBuildConfigParams = {
    info: ModuleInfo;
    packagePath: string;
};

export async function getModuleBuildConfig({
    info,
    packagePath
}: GetModuleBuildConfigParams): Promise<ModuleBuildConfig> {
    const MX_PROJECT_PATH = process.env.MX_PROJECT_PATH;
    const { name: packageName, version, moduleFolderNameInModeler, mpkName, mxpackage } = info;

    console.info(`Creating build config for ${packageName}...`);

    if (MX_PROJECT_PATH) {
        console.info(fgGreen(`targetProject: using project path from MX_PROJECT_PATH.`));
    }

    const paths = {
        package: packagePath,
        dist: join(packagePath, "dist"),
        tmp: join(packagePath, "dist/tmp"),
        targetProject: MX_PROJECT_PATH ? MX_PROJECT_PATH : join(packagePath, "tests/testProject"),
        themesource: join(packagePath, "src/themesource", moduleFolderNameInModeler),
        javascriptsource: join(packagePath, "src/javascriptsource", moduleFolderNameInModeler)
    };

    const output = {
        dirs: {
            themesource: join(paths.targetProject, "themesource", moduleFolderNameInModeler),
            javascriptsource: join(paths.targetProject, "javascriptsource", moduleFolderNameInModeler),
            widgets: join(paths.targetProject, "widgets")
        },
        files: {
            mpk: join(paths.dist, version.format(), mpkName),
            modulePackage: join(paths.targetProject, mpkName)
        }
    };

    const result = {
        name: packageName,
        dependencies: mxpackage.dependencies,
        paths,
        output
    };

    return result;
}

type ModuleBuildConfigsResult = [ModuleInfo, ModuleBuildConfig];

export async function getModuleConfigs(packagePath: string): Promise<ModuleBuildConfigsResult> {
    const info = await getModuleInfo(packagePath);
    const config = await getModuleBuildConfig({ packagePath, info });

    return [info, config];
}
