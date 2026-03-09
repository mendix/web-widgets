import Archiver from "archiver";
import { copyFileSync, createWriteStream, existsSync, mkdirSync, rmSync } from "fs";
import { cp } from "fs/promises";
import { join, resolve } from "path";
import type { ResolvedConfig } from "../types";

async function copyDir(src: string, dest: string): Promise<void> {
    mkdirSync(dest, { recursive: true });
    if (existsSync(src)) {
        await cp(src, dest, { recursive: true, force: true });
    }
}

export async function createMPK(options: ResolvedConfig): Promise<string> {
    const distPath = resolve(process.cwd(), "dist");
    const tmpWidgetsPath = join(distPath, "tmp", "widgets");
    const stagingDir = join(distPath, "widgets");
    const outputDir = join(process.cwd(), "dist", options.widgetVersion);
    const mpkPath = join(outputDir, options.mpkName);

    if (existsSync(stagingDir)) {
        rmSync(stagingDir, { recursive: true });
    }
    mkdirSync(stagingDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    for (const file of options.metadataFiles) {
        const srcPath = resolve(process.cwd(), file.src);
        const destPath = join(stagingDir, file.dest);
        mkdirSync(join(stagingDir, file.dest.split("/").slice(0, -1).join("/")), { recursive: true });
        if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath);
        }
    }

    for (const requiredArtifact of options.requiredArtifacts ?? []) {
        const requiredPath = join(tmpWidgetsPath, requiredArtifact);
        if (!existsSync(requiredPath)) {
            throw new Error(`Missing compiled artifact: ${requiredPath}`);
        }
    }

    for (const removePath of options.removeBeforeCopy ?? []) {
        const absolutePath = join(tmpWidgetsPath, removePath);
        if (existsSync(absolutePath)) {
            rmSync(absolutePath);
        }
    }

    if (existsSync(tmpWidgetsPath)) {
        await copyDir(tmpWidgetsPath, stagingDir);
    }

    await new Promise<void>((resolvePromise, reject) => {
        const output = createWriteStream(mpkPath);
        const archive = (Archiver as unknown as (format: string, options: { zlib: { level: number } }) => any)("zip", {
            zlib: { level: 9 }
        });

        output.on("close", () => {
            console.log(`Created ${mpkPath} (${archive.pointer()} bytes)`);
            resolvePromise();
        });

        archive.on("error", reject);
        archive.pipe(output);
        archive.directory(stagingDir, false);
        archive.finalize();
    });

    return mpkPath;
}

export async function deployMPKToMxProject(mpkPath: string): Promise<void> {
    const mxProjectPath = process.env.MX_PROJECT_PATH;

    if (!mxProjectPath) {
        return;
    }

    const widgetsDir = resolve(mxProjectPath, "widgets");
    const fileName = mpkPath.split("/").pop();

    if (!fileName) {
        throw new Error(`Invalid MPK path: ${mpkPath}`);
    }

    mkdirSync(widgetsDir, { recursive: true });
    const targetPath = join(widgetsDir, fileName);
    copyFileSync(mpkPath, targetPath);
    console.log(`Deployed ${fileName} to ${widgetsDir}`);
}
