import { writeFile, readFile } from "node:fs/promises";
import { dirname, join, parse, relative, resolve } from "path";
import { fgYellow } from "./ansi-colors";
import {
    CommonBuildConfig,
    getModuleConfigs,
    getWidgetConfigs,
    ModuleBuildConfig,
    WidgetBuildConfig
} from "./build-config";
import { cloneRepo, cloneRepoShallow, setLocalGitUserInfo } from "./git";
import { copyMpkFiles, getMpkPaths } from "./monorepo";
import { createModuleMpkInDocker } from "./mpk";
import { ModuleInfo, PackageInfo, WidgetInfo } from "./package-info";
import { addFilesToPackageXml, PackageType } from "./package-xml";
import { cp, ensureFileExists, exec, mkdir, popd, pushd, rm, unzip, zip, chmod } from "./shell";

type Step<Info, Config> = (params: { info: Info; config: Config }) => Promise<void>;

export type CommonStepParams = {
    info: PackageInfo;
    config: CommonBuildConfig;
};

export type WidgetStepParams = {
    info: WidgetInfo;
    config: WidgetBuildConfig;
};

export type ModuleStepParams = {
    info: ModuleInfo;
    config: ModuleBuildConfig;
};

export const logStep = (name: string): void => console.info(`[step]: ${name}`);

// Common steps

export async function removeDist({ config }: CommonStepParams): Promise<void> {
    logStep("Remove dist");

    rm("-rf", config.paths.dist);
}

export async function cloneTestProject({ info, config }: CommonStepParams): Promise<void> {
    logStep("Clone test project");

    const { testProject } = info;
    const clone = process.env.CI ? cloneRepoShallow : cloneRepo;
    rm("-rf", config.paths.targetProject);
    await clone({
        remoteUrl: testProject.githubUrl,
        branch: testProject.branchName,
        localFolder: config.paths.targetProject
    });
}

type CopyFileEntry = {
    /** File path relative to project root */
    filePath: string;
    /** Path relative to package (will be included in package.xml) */
    pkgPath: string;
};

/**
 * Copy files to mpk
 *
 * Example:
 *  copyFilesToMpk([
 *      { filePath: "LICENSE", pkgPath: "themesource/mymodule/LICENSE" },
 *      { filePath: "src/index.js", pkgPath: "some/deep/data.js" },
 *      { filePath: "package.json", pkgPath: "boba/zuza/out.json" }
 *  ])
 */
export function copyFilesToMpk(
    files: CopyFileEntry[],
    packageType: PackageType
): (params: CommonStepParams) => Promise<void> {
    return async ({ config }) => {
        logStep("Copy files to mpk");

        const { paths, output } = config;
        const mpk = output.files.mpk;
        const target = join(paths.tmp, "copyfiles_tmp");
        const packageXml = join(target, "package.xml");

        console.log(`Input MPK: ${relative(paths.package, mpk)}`);

        ensureFileExists(output.files.mpk);

        rm("-rf", target);
        mkdir("-p", target);

        console.info("Unzip module mpk");
        await unzip(mpk, target);

        for (const file of files) {
            const source = resolve(paths.package, file.filePath);
            const dest = resolve(target, file.pkgPath);

            console.info(`Copy ${join(file.filePath)} to ${join(file.pkgPath)}`);
            mkdir("-p", dirname(dest));
            cp(source, dest);
        }

        console.info(`Update file entries in package.xml`);
        await addFilesToPackageXml(
            packageXml,
            files.map(f => f.pkgPath),
            packageType
        );

        console.info("Create module zip archive");
        rm(mpk);
        await zip(target, mpk);
        rm("-rf", target);
    };
}

// Module steps

export async function copyThemesourceToProject({ config }: ModuleStepParams): Promise<void> {
    logStep("Copy module themesource to project");

    const { output, paths } = config;
    console.info("Remove module themesource in targetProject");
    rm("-rf", output.dirs.themesource);
    console.info("Copy module themesource to targetProject");
    mkdir("-p", output.dirs.themesource);
    cp("-R", `${paths.themesource}/*`, output.dirs.themesource);
}

export function copyActionsFiles(files: string[]): (params: ModuleStepParams) => Promise<void> {
    return async ({ config }) => {
        logStep("Copy JS Action(s) files");
        const { paths, output } = config;
        mkdir("-p", join(output.dirs.javascriptsource, "actions"));

        for (const file of files) {
            const src = join(paths.javascriptsource, "actions", file);
            const dest = join(output.dirs.javascriptsource, "actions", file);
            const content = await readFile(src, { encoding: "utf-8" });
            // Studio Pro require CRLF endings to read action file.
            await writeFile(dest, content.replace(/\r\n|\r|\n/g, "\r\n"));
        }
    };
}

export async function copyWidgetsToProject({ config }: ModuleStepParams): Promise<void> {
    logStep("Copy module widgets to project");

    await copyMpkFiles(config.dependencies, config.output.dirs.widgets);
}

export async function createModuleMpk({ info, config }: ModuleStepParams): Promise<void> {
    logStep("Create module mpk");

    await createModuleMpkInDocker(
        config.paths.targetProject,
        info.mxpackage.name,
        info.marketplace.minimumMXVersion,
        "^(resources|userlib)/.*"
    );
}

export async function addWidgetsToMpk({ config }: ModuleStepParams): Promise<void> {
    logStep("Add widgets to mpk");

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
    chmod("-R", "a+rw", target);

    console.info(`Add ${widgets.length} widgets to ${mpkEntry.base}`);
    cp(widgets, widgetsOut);

    console.info(`Add file entries to package.xml`);
    await addFilesToPackageXml(packageXml, packageFilePaths, "modelerProject");
    rm(mpk);

    console.info("Create module zip archive");
    await zip(target, mpk);
    rm("-rf", target);
}

export async function moveModuleToDist({ info, config }: ModuleStepParams): Promise<void> {
    logStep("Move module to dist");

    const { output, paths } = config;

    console.info(`Move ${info.mpkName} to dist`);
    mkdir("-p", join(paths.dist, info.version.format()));
    // Can't use mv because of https://github.com/shelljs/shelljs/issues/878
    cp(output.files.modulePackage, output.files.mpk);
    rm(output.files.modulePackage);
}

export async function pushUpdateToTestProject({ info, config }: ModuleStepParams): Promise<void> {
    logStep("Push update to test project");

    if (!process.env.CI) {
        console.warn(fgYellow("You run script in non CI env"));
        console.warn(fgYellow("Set CI=1 in your env if you want to push changes to remote test project"));
        console.warn(fgYellow("Skip push step"));
        return;
    }

    const { paths } = config;
    pushd(paths.targetProject);

    const status = (await exec(`git status --porcelain`, { stdio: "pipe" })).stdout.trim();

    if (status === "") {
        console.warn(fgYellow("Nothing to commit"));
        console.warn(fgYellow("Skip push step"));
        return;
    }

    await setLocalGitUserInfo();
    await exec(`git add .`);
    await exec(`git commit -m "Automated update for ${info.mxpackage.name} module"`);
    await exec(`git push origin`);
    popd();
}

export async function writeModuleVersion({ config, info }: ModuleStepParams): Promise<void> {
    logStep("Write module version");

    mkdir("-p", config.output.dirs.themesource);
    await writeFile(join(config.output.dirs.themesource, ".version"), info.version.format());
}

export async function copyModuleLicense({ config }: ModuleStepParams): Promise<void> {
    logStep("Copy module license");

    const { paths, output } = config;
    const license = join(paths.package, "LICENSE");

    ensureFileExists(license);
    mkdir("-p", output.dirs.themesource);
    cp(license, output.dirs.themesource);
}

export async function writeVersionAndLicenseToJSActions({ config, info }: ModuleStepParams): Promise<void> {
    logStep("Write module version & LICENSE");
    const { paths, output } = config;
    const license = join(paths.package, "LICENSE");

    ensureFileExists(license);

    mkdir("-p", output.dirs.javascriptsource);
    cp(license, output.dirs.javascriptsource);
    await writeFile(join(config.output.dirs.javascriptsource, ".version"), info.version.format());
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
    packagePath: string;
    steps: Array<Step<WidgetInfo, WidgetBuildConfig>>;
};

export async function runWidgetSteps(params: RunWidgetStepsParams): Promise<void> {
    const [packageInfo, config] = await getWidgetConfigs(params.packagePath);

    await runSteps({
        packageInfo,
        config,
        steps: params.steps
    });
}

type RunModuleStepsParams = {
    packagePath: string;
    steps: Array<Step<ModuleInfo, ModuleBuildConfig>>;
};

export async function runModuleSteps(params: RunModuleStepsParams): Promise<void> {
    const [packageInfo, config] = await getModuleConfigs(params.packagePath);

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
