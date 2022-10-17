import { WidgetChangelogFileWrapper } from "./changelog-parser";
import { ModuleInfo, PackageInfo, WidgetInfo } from "./package-info";
import { exec, find, mkdir, cp, rm } from "./shell";
import { gh } from "./github";
import { listPackages } from "./monorepo";
import {
    CommonBuildConfig,
    getModuleConfigs,
    getWidgetConfigs,
    ModuleBuildConfig,
    WidgetBuildConfig
} from "./build-config";

export async function updateChangelogsAndCreatePR(
    packageInfo: PackageInfo,
    changelog: WidgetChangelogFileWrapper,
    releaseTag: string,
    remoteName: string
): Promise<void> {
    const releaseBranchName = `${releaseTag}-update-changelog`;

    console.log(`Creating branch '${releaseBranchName}'...`);
    await exec(`git checkout -b ${releaseBranchName}`);

    console.log("Updating CHANGELOG.md...");
    const updatedChangelog = changelog.moveUnreleasedToVersion(packageInfo.version);
    updatedChangelog.save();

    console.log(`Committing CHANGELOG.md to '${releaseBranchName}' and pushing to remote...`);
    await exec(`git add ${changelog.changelogPath}`);
    await exec(`git commit -m "chore(${packageInfo.packageName}): update changelog"`);
    await exec(`git push ${remoteName} ${releaseBranchName}`);

    console.log(`Creating pull request for '${releaseBranchName}'`);
    await gh.createGithubPRFrom({
        title: `${packageInfo.appName} v${packageInfo.version.format()}: Update changelog`,
        body: "This is an automated PR that merges changelog update to master.",
        base: "main",
        head: releaseBranchName,
        repo: packageInfo.repositoryUrl
    });

    console.log("Created PR for changelog updates.");
}

export async function copyMpkFiles(packageNames: string[], dest: string): Promise<void> {
    const packages = await listPackages(packageNames);
    const paths = [...find(packages.map(p => `${p.path}/dist/${p.version}/*.mpk`))];
    mkdir("-p", dest);
    cp(paths, dest);
}

type CommonStepParams = {
    info: PackageInfo;
    config: CommonBuildConfig;
};

type ModuleStepParams = {
    info: ModuleInfo;
    config: ModuleBuildConfig;
};

export async function removeDist({ config }: CommonStepParams): Promise<void> {
    console.info("Remove dist");
    rm("-rf", config.paths.dist);
}

export async function copyThemesourceToProject({ config }: ModuleStepParams): Promise<void> {
    console.info("Remove module themesource in targetProject");
    rm("-rf", config.output.dirs.themesource);
    console.info("Copy module themesource to targetProject");
    mkdir("-p", config.output.dirs.themesource);
    cp("-R", `${config.paths.themesource}/*`, config.output.dirs.themesource);
}

export async function copyWidgetsToProject({ config }: ModuleStepParams): Promise<void> {
    console.info("Copy module widgets to targetProject");
    await copyMpkFiles(config.dependencies, config.output.dirs.widgets);
}

type Step<Info, Config> = (params: { info: Info; config: Config }) => Promise<void>;

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

    // console.dir(packageInfo, { depth: 10 });
    // console.dir(config, { depth: 10 });

    await runSteps({
        packageInfo,
        config,
        steps: params.steps
    });
}
