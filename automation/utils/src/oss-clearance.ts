import { globSync } from "glob";
import { basename, join, parse } from "path";
import { homedir, tmpdir } from "node:os";
import { mkdtemp, stat } from "node:fs/promises";
import { chmod, cp, exec, mkdir, mv, rm, unzip, zip } from "./shell";
import chalk from "chalk";

export function findAllReadmeOssLocally(): string[] {
    const readmeossPattern = join("**", `*__*__READMEOSS_*.html`);
    const path1 = join(homedir(), "Downloads");
    const path2 = join(homedir(), "Documents");

    const matchingFiles1 = globSync(readmeossPattern, { cwd: path1, absolute: true, ignore: "**/.*/**" });
    const matchingFiles2 = globSync(readmeossPattern, { cwd: path2, absolute: true, ignore: "**/.*/**" });

    return matchingFiles1.concat(matchingFiles2);
}

export function getRecommendedReadmeOss(
    packageName: string,
    packageVersion: string,
    availableReadmes: string[]
): string | undefined {
    const fileNames = availableReadmes.map(r => [basename(r), r]);

    return fileNames.find(([name]) => name.includes(packageName) && name.includes(packageVersion))?.at(1);
}

export async function createSBomGeneratorFolderStructure(
    assetNameAndVersion: string
): Promise<[folder: string, assetPath: string]> {
    const tmpFolder = await mkdtemp(join(tmpdir(), "tmp_OSS_Clearance_Artifacts_"));
    const artifactsFolder = join(tmpFolder, "SBOM_GENERATOR", assetNameAndVersion);
    await mkdir("-p", artifactsFolder);
    return [tmpFolder, join(artifactsFolder, `${assetNameAndVersion}.mpk`)];
}

export async function generateSBomArtifactsInFolder(
    tmpFolder: string,
    generatorBinaryPath: string,
    expectedName: string,
    finalPath: string
): Promise<void> {
    // run generator
    await exec(`java -jar ${generatorBinaryPath} SBOM_GENERATOR unzip`, { cwd: tmpFolder });
    await exec(`java -jar ${generatorBinaryPath} SBOM_GENERATOR scan`, { cwd: tmpFolder });

    // check results
    const resultsFolder = join(tmpFolder, "CCA_JSON");
    const assetsFolder = join(resultsFolder, expectedName);
    const assets = await stat(assetsFolder);
    if (!assets.isDirectory()) {
        throw new Error("Can't find assets folder");
    }

    // archive results
    const archiveName = `${expectedName}.zip`;
    await zip(resultsFolder, archiveName);
    const ossArtifactZip = join(resultsFolder, archiveName);

    // move to final destination
    await mv(ossArtifactZip, finalPath);

    // removing tmp folder
    await rm("-rf", tmpFolder);
}

export async function includeReadmeOssIntoMpk(readmeOssPath: string, mpkPath: string): Promise<void> {
    const mpkEntry = parse(mpkPath);
    const unzipTarget = join(mpkEntry.dir, "tmp");

    // unzip
    rm("-rf", unzipTarget);
    await unzip(mpkPath, unzipTarget);
    chmod("-R", "a+rw", unzipTarget);

    // Copy the READMEOSS file to the target directory
    cp(readmeOssPath, unzipTarget);

    // zip it back
    await zip(unzipTarget, mpkPath);

    // remove tmp folder
    rm("-rf", unzipTarget);
}
