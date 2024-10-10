import { basename, join } from "path";
import { ModuleInfo } from "./package-info";
import { exec, find } from "./shell";
import { Version } from "./version";

async function ensureMxBuildDockerImageExists(mendixVersion: Version): Promise<void> {
    const version = mendixVersion.format(true);

    const existingImages = (await exec(`docker image ls -q mxbuild:${version}`, { stdio: "pipe" })).stdout.trim();
    if (!existingImages) {
        console.log(`Creating new mxbuild:${version} docker image...`);
        const versionMajor = mendixVersion.major;
        const dockerfilePath =
            versionMajor < 10
                ? join(__dirname, "../docker/mxbuild.Dockerfile")
                : join(__dirname, "../docker/mxbuildMx10.Dockerfile");
        await exec(
            `docker build -f ${dockerfilePath} ` +
                `--build-arg MENDIX_VERSION=${version} ` +
                `-t mxbuild:${version} ${process.cwd()}`
        );
    }
}

export async function createModuleMpkInDocker(
    sourceDir: string,
    moduleName: string,
    mendixVersion: Version,
    excludeFilesRegExp: string
): Promise<void> {
    const version = mendixVersion.format(true);
    const versionMajor = mendixVersion.major;
    await ensureMxBuildDockerImageExists(mendixVersion);

    console.log(`Creating module ${moduleName} using mxbuild:${version}...`);
    // Build testProject via mxbuild
    const mprPath = find(`${sourceDir}/*.mpr`)[0];
    const projectFile = basename(mprPath);
    const args = [
        // update widgets
        "mx",
        "update-widgets",
        "--loose-version-check",
        `/source/${projectFile}`,
        "&&",

        // and create module
        versionMajor < 10 ? "mono" : "",
        versionMajor >= 10
            ? "/tmp/mxbuild/modeler/mx create-module-package"
            : "/tmp/mxbuild/modeler/mxutil.exe create-module-package",
        excludeFilesRegExp ? `--exclude-files='${excludeFilesRegExp}'` : "",
        `/source/${projectFile}`,
        moduleName
    ].join(" ");

    await exec(`docker run -v ${sourceDir}:/source --rm mxbuild:${version} bash -c "${args}"`);
    console.log(`Module ${moduleName} created successfully.`);
    if (process.env.CI) {
        console.info("Changing sourceDir ownership...");
        await exec(`sudo chown -R "$(id -u):$(id -g)" ${sourceDir}`);
    }
}

export async function createMPK(tmpFolder: string, info: ModuleInfo, excludeFilesRegExp: string): Promise<string> {
    await createModuleMpkInDocker(
        tmpFolder,
        info.mxpackage.name,
        info.marketplace.minimumMXVersion,
        excludeFilesRegExp
    );
    return find(join(tmpFolder, info.mpkName))[0];
}
