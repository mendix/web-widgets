import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, parse, relative, resolve } from "path";
import chalk from "chalk";
import {
    type CommonBuildConfig,
    getModuleConfigs,
    getWidgetConfigs,
    type ModuleBuildConfig,
    type WidgetBuildConfig
} from "./build-config.ts";
import { cloneRepo, cloneRepoShallow, setLocalGitUserInfo } from "./git.ts";
import { copyMpkFiles, getMpkPaths } from "./monorepo.ts";
import { createModuleMpkInDocker } from "./mpk.ts";
import type { ModuleInfo, PackageInfo, WidgetInfo } from "./package-info.ts";
import { addFilesToPackageXml, type PackageType } from "./package-xml.ts";
import { ensureFileExists, exec, makeWritableRecursive, move, unzip, zip } from "./shell.ts";

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

    await rm(config.paths.dist, { recursive: true, force: true });
}

export async function cloneTestProject({ info, config }: CommonStepParams): Promise<void> {
    logStep("Clone test project");

    const { testProject } = info;
    const clone = process.env.CI ? cloneRepoShallow : cloneRepo;
    await rm(config.paths.targetProject, { recursive: true, force: true });
    await clone({
        remoteUrl: testProject!.githubUrl,
        branch: testProject!.branchName,
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

        await ensureFileExists(output.files.mpk);

        await rm(target, { recursive: true, force: true });
        await mkdir(target, { recursive: true });

        console.info("Unzip module mpk");
        await unzip(mpk, target);

        for (const file of files) {
            const source = resolve(paths.package, file.filePath);
            const dest = resolve(target, file.pkgPath);

            console.info(`Copy ${join(file.filePath)} to ${join(file.pkgPath)}`);
            await mkdir(dirname(dest), { recursive: true });
            await cp(source, dest);
        }

        console.info(`Update file entries in package.xml`);
        await addFilesToPackageXml(
            packageXml,
            files.map(f => f.pkgPath),
            packageType
        );

        console.info("Create module zip archive");
        await rm(mpk);
        await zip(target, mpk);
        await rm(target, { recursive: true, force: true });
    };
}

// Module steps

export async function copyThemesourceToProject({ config }: ModuleStepParams): Promise<void> {
    logStep("Copy module themesource to project");

    const { output, paths } = config;
    console.info("Remove module themesource in targetProject");
    await rm(output.dirs.themesource, { recursive: true, force: true });
    console.info("Copy module themesource to targetProject");
    await cp(paths.themesource, output.dirs.themesource, { recursive: true });
}

export function copyActionsFiles(files: string[]): (params: ModuleStepParams) => Promise<void> {
    return async ({ config }) => {
        logStep("Copy JS Action(s) files");
        const { paths, output } = config;
        await mkdir(join(output.dirs.javascriptsource, "actions"), { recursive: true });

        for (const file of files) {
            const src = join(paths.javascriptsource, "actions", file);
            const dest = join(output.dirs.javascriptsource, "actions", file);
            const content = await readFile(src, { encoding: "utf-8" });
            // Studio Pro require CRLF endings to read action file.
            console.log(">", dest);
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

async function insertWidgetsIntoMpk(
    mpk: string,
    widgetPaths: string[],
    tmpDir: string,
    additionalFiles?: Array<{ src: string; destRelative: string }>
): Promise<void> {
    const mpkEntry = parse(mpk);
    const widgetsOut = join(tmpDir, "widgets");
    const packageXml = join(tmpDir, "package.xml");
    const packageFilePaths = widgetPaths.map(p => `widgets/${parse(p).base}`);

    await rm(tmpDir, { recursive: true, force: true });
    console.info("Unzip module mpk");
    await unzip(mpk, tmpDir);
    await mkdir(widgetsOut, { recursive: true });
    await makeWritableRecursive(tmpDir);

    console.info(`Add ${widgetPaths.length} widgets to ${mpkEntry.base}`);
    for (const widgetPath of widgetPaths) {
        await cp(widgetPath, join(widgetsOut, basename(widgetPath)));
    }

    if (additionalFiles) {
        for (const { src, destRelative } of additionalFiles) {
            await cp(src, join(tmpDir, destRelative));
        }
    }

    console.info(`Add file entries to package.xml`);
    await addFilesToPackageXml(packageXml, packageFilePaths, "modelerProject");
    await rm(mpk);

    console.info("Create module zip archive");
    await zip(tmpDir, mpk);
    await rm(tmpDir, { recursive: true, force: true });
}

export async function addWidgetsToMpk({ config }: ModuleStepParams): Promise<void> {
    logStep("Add widgets to mpk");

    const mpk = config.output.files.modulePackage;
    const widgets = await getMpkPaths(config.dependencies);
    const tmpDir = join(parse(mpk).dir, "tmp");

    await insertWidgetsIntoMpk(mpk, widgets, tmpDir, [
        { src: join(config.paths.package, "LICENSE"), destRelative: "License.txt" }
    ]);
}

export function addTestProjectWidgetsToMpk(widgetFileNames: string[]): (params: ModuleStepParams) => Promise<void> {
    return async ({ config }) => {
        logStep("Add test project widgets to mpk");

        const mpk = config.output.files.modulePackage;
        const widgetPaths = widgetFileNames.map(name => join(config.output.dirs.widgets, name));
        const tmpDir = join(parse(mpk).dir, "tmp_local_widgets");

        await insertWidgetsIntoMpk(mpk, widgetPaths, tmpDir);
    };
}

export async function moveModuleToDist({ info, config }: ModuleStepParams): Promise<void> {
    logStep("Move module to dist");

    const { output, paths } = config;

    console.info(`Move ${info.mpkName} to dist`);
    await mkdir(join(paths.dist, info.version.format()), { recursive: true });
    await move(output.files.modulePackage, output.files.mpk);
}

export async function pushUpdateToTestProject({ info, config }: ModuleStepParams): Promise<void> {
    logStep("Push update to test project");

    if (!process.env.CI) {
        console.warn(chalk.yellow("You run script in non CI env"));
        console.warn(chalk.yellow("Set CI=1 in your env if you want to push changes to remote test project"));
        console.warn(chalk.yellow("Skip push step"));
        return;
    }

    const cwd = config.paths.targetProject;

    const status = (await exec(`git status --porcelain`, { cwd, stdio: "pipe" })).stdout.trim();

    if (status === "") {
        console.warn(chalk.yellow("Nothing to commit"));
        console.warn(chalk.yellow("Skip push step"));
        return;
    }

    await setLocalGitUserInfo(cwd);
    await exec(`git add .`, { cwd });
    await exec(`git commit -m "Automated update for ${info.mxpackage.name} module [${info.version}]"`, { cwd });
    await exec(`git push origin`, { cwd });
}

export async function writeModuleVersion({ config, info }: ModuleStepParams): Promise<void> {
    logStep("Write module version");

    await mkdir(config.output.dirs.themesource, { recursive: true });
    await writeFile(join(config.output.dirs.themesource, ".version"), info.version.format());
}

export async function copyModuleLicense({ config }: ModuleStepParams): Promise<void> {
    logStep("Copy module license");

    const { paths, output } = config;
    const license = join(paths.package, "LICENSE");

    await ensureFileExists(license);
    await mkdir(output.dirs.themesource, { recursive: true });
    await cp(license, join(output.dirs.themesource, "LICENSE"));
}

export async function writeVersionAndLicenseToJSActions({ config, info }: ModuleStepParams): Promise<void> {
    logStep("Write module version & LICENSE");
    const { paths, output } = config;
    const license = join(paths.package, "LICENSE");

    await ensureFileExists(license);

    await mkdir(output.dirs.javascriptsource, { recursive: true });
    await cp(license, join(output.dirs.javascriptsource, "LICENSE"));
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
