#!/usr/bin/env ts-node-script

import { homedir } from "node:os";
import { join } from "node:path";
import { gh } from "../src/github";
import { createSBomGeneratorFolderStructure, generateSBomArtifactsInFolder } from "../src/oss-clearance";

async function main(): Promise<void> {
    const releaseTag = process.argv[2];
    const releaseName = process.argv[3];

    if (!releaseTag || !releaseName) {
        throw new Error(
            'Usage: rui-generate-oss-sbom <release-tag> "<Release Name>"\nExample: rui-generate-oss-sbom combobox-web-v2.9.0 "Combo box v2.9.0"'
        );
    }

    await gh.ensureAuth();

    const releaseId = await gh.getReleaseIdByReleaseTag(releaseTag);
    if (!releaseId) {
        throw new Error(`No GitHub release found for tag '${releaseTag}'`);
    }

    const assets = await gh.listReleaseAssets(releaseId);
    const mpk = assets.find(a => a.name.endsWith(".mpk"));
    if (!mpk) {
        throw new Error(`No .mpk asset found on release '${releaseTag}'`);
    }

    const [tmpFolder, downloadPath] = await createSBomGeneratorFolderStructure(releaseName);
    await gh.downloadReleaseAsset(mpk.id, downloadPath);

    const generatorJar = process.env.SBOM_GENERATOR_JAR ?? join(homedir(), "SBOM_Generator.jar");
    const finalPath = join(homedir(), "Downloads", `${releaseName} [pending-hash].zip`);

    await generateSBomArtifactsInFolder(tmpFolder, generatorJar, releaseName, finalPath);

    console.log(JSON.stringify({ path: finalPath }));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
