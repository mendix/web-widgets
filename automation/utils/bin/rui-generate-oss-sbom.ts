#!/usr/bin/env ts-node-script

import { homedir } from "node:os";
import { join } from "node:path";
import { gh } from "../src/github";
import {
    createSBomGeneratorFolderStructure,
    generateSBomArtifactsInFolder,
    verifyAssetDigest
} from "../src/oss-clearance";

async function main(): Promise<void> {
    const releaseTag = process.argv[2];

    if (!releaseTag) {
        throw new Error(
            "Usage: rui-generate-oss-sbom <release-tag>\nExample: rui-generate-oss-sbom combobox-web-v2.9.0"
        );
    }

    await gh.ensureAuth();

    const release = await gh.getReleaseByTag(releaseTag);
    if (!release) {
        throw new Error(`No GitHub release found for tag '${releaseTag}'`);
    }
    const releaseName = release.name;

    const mpk = release.assets.find(asset => asset.name.endsWith(".mpk"));
    if (!mpk) {
        throw new Error(`No .mpk asset found on release '${releaseTag}'`);
    }

    const [tmpFolder, downloadPath] = await createSBomGeneratorFolderStructure(releaseName);
    await gh.downloadReleaseAsset(mpk.id, downloadPath);
    const fileHash = await verifyAssetDigest(mpk, downloadPath);

    const generatorJar = process.env.SBOM_GENERATOR_JAR ?? join(homedir(), "SBOM_Generator.jar");
    const finalPath = join(homedir(), "Downloads", `${releaseName} [${fileHash}].zip`);

    await generateSBomArtifactsInFolder(tmpFolder, generatorJar, releaseName, finalPath);

    console.log(JSON.stringify({ path: finalPath, mpk: mpk.name, sha256: fileHash }));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
