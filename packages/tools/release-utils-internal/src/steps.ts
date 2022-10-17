import { join, parse } from "path";
import {
    CommonBuildConfig,
    getModuleConfigs,
    getWidgetConfigs,
    ModuleBuildConfig,
    WidgetBuildConfig
} from "./build-config";
import { cloneRepo, cloneRepoShallow } from "./git";
import { getMpkPaths, copyMpkFiles } from "./monorepo";
import { addFilesToPackageXml, createModuleMpkInDocker } from "./mpk";
import { ModuleInfo, PackageInfo, WidgetInfo } from "./package-info";
import { cp, echo, mkdir, rm, unzip, zip } from "./shell";

type Step<Info, Config> = (params: { info: Info; config: Config }) => Promise<void>;

type CommonStepParams = {
    info: PackageInfo;
    config: CommonBuildConfig;
};

type ModuleStepParams = {
    info: ModuleInfo;
    config: ModuleBuildConfig;
};

// Common steps

export async function removeDist({ config }: CommonStepParams): Promise<void> {
    console.info("Remove dist");
    rm("-rf", config.paths.dist);
}

export async function cloneTestProject({ info, config }: CommonStepParams): Promise<void> {
    const { testProjectUrl, testProjectBranchName } = info;

    console.info("Clone project from remote repository");
    const clone = process.env.CI ? cloneRepoShallow : cloneRepo;
    await clone({
        remoteUrl: testProjectUrl,
        branch: testProjectBranchName,
        localFolder: config.paths.targetProject
    });
}

// Module steps

export async function copyThemesourceToProject({ config, info }: ModuleStepParams): Promise<void> {
    const { output, paths } = config;
    console.info("Remove module themesource in targetProject");
    rm("-rf", output.dirs.themesource);
    console.info("Copy module themesource to targetProject");
    mkdir("-p", output.dirs.themesource);
    cp("-R", `${paths.themesource}/*`, output.dirs.themesource);
    console.info("Write themesouce version");
    echo(info.version.format()).to(join(output.dirs.themesource, ".version"));
}

export async function copyWidgetsToProject({ config }: ModuleStepParams): Promise<void> {
    console.info("Copy module widgets to targetProject");
    await copyMpkFiles(config.dependencies, config.output.dirs.widgets);
}

export async function createModuleMpk({ info, config }: ModuleStepParams): Promise<void> {
    await createModuleMpkInDocker(
        config.paths.targetProject,
        info.moduleNameInModeler,
        info.minimumMXVersion,
        "^(resources|userlib)/.*"
    );
}

export async function addWidgetsToMpk({ config }: ModuleStepParams): Promise<void> {
    const mpk = config.output.files.modulePackage;
    const widgets = await getMpkPaths(config.dependencies);
    const mpkEntry = parse(mpk);
    const target = join(mpkEntry.dir, "tmp");
    const widgetsOut = join(target, "widgets");
    const packageXml = join(target, "package.xml");
    const packageFilePaths = widgets.map(path => `widgets/${parse(path).base}`);

    rm("-rf", target);

    console.info("Unzip module mpk");
    await unzip(mpk, target);
    mkdir("-p", widgetsOut);

    console.info(`Add ${widgets.length} widgets to ${mpkEntry.base}`);
    cp(widgets, widgetsOut);

    console.info(`Add file entries to package.xml`);
    await addFilesToPackageXml(packageXml, packageFilePaths);
    rm(mpk);

    console.info("Create module zip archive");
    await zip(target, mpk);
    rm("-rf", target);
}

export async function moveModuleToDist({ info, config }: ModuleStepParams): Promise<void> {
    const { output, paths } = config;

    console.info(`Move ${info.moduleNameInModeler}.mpk to dist`);
    mkdir("-p", join(paths.dist, info.version.format()));
    // Can't use mv because of https://github.com/shelljs/shelljs/issues/878
    cp(output.files.modulePackage, output.files.mpk);
    rm(output.files.modulePackage);
}

export async function runSteps<Info, Config>(params: {
    packageInfo: Info;
    config: Config;
    steps: Array<Step<Info, Config>>;
}): Promise<void> {
    for (const step of params.steps) {
        await step({ info: params.packageInfo, config: params.config });
    }
}

type RunWidgetStepsParams = {
    dependencies: string[];
    packagePath: string;
    steps: Array<Step<WidgetInfo, WidgetBuildConfig>>;
};

export async function runWidgetSteps(params: RunWidgetStepsParams): Promise<void> {
    const [packageInfo, config] = await getWidgetConfigs(params);

    await runSteps({
        packageInfo,
        config,
        steps: params.steps
    });
}

type RunModuleStepsParams = {
    dependencies: string[];
    packagePath: string;
    steps: Array<Step<ModuleInfo, ModuleBuildConfig>>;
};

export async function runModuleSteps(params: RunModuleStepsParams): Promise<void> {
    const [packageInfo, config] = await getModuleConfigs(params);

    if (process.env.DEBUG) {
        console.dir(packageInfo, { depth: 10 });
        console.dir(config, { depth: 10 });
    }

    await runSteps({
        packageInfo,
        config,
        steps: params.steps
    });
}
