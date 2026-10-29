import { globSync } from "node:fs";
import { access, chmod, cp, lstat, readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import crossZip from "cross-zip";
import execa from "execa";

export function exec(command: string, options?: execa.Options): execa.ExecaChildProcess {
    const { stdio = "inherit", ...execaOptions } = options ?? {};

    return execa(command, { shell: true, stdio, ...execaOptions });
}

export async function ensureFileExists(file: string): Promise<void> {
    await access(file);
}

/** Expand glob patterns, failing when a pattern matches nothing. */
export function findFiles(...patterns: string[]): string[] {
    return patterns.flatMap(pattern => {
        const matches = globSync(pattern);
        if (matches.length === 0) {
            throw new Error(`No files match '${pattern}'`);
        }
        return matches;
    });
}

/** Move a file or directory, falling back to copy and remove when rename crosses file systems. */
export async function move(source: string, dest: string): Promise<void> {
    try {
        await rename(source, dest);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EXDEV") {
            throw error;
        }
        await cp(source, dest, { recursive: true });
        await rm(source, { recursive: true, force: true });
    }
}

/** Add read and write permissions for everyone to a directory and everything inside it (`chmod -R a+rw`). */
export async function makeWritableRecursive(dir: string): Promise<void> {
    const entries = await readdir(dir, { recursive: true });
    for (const path of [dir, ...entries.map(entry => join(dir, entry))]) {
        const stats = await lstat(path);
        if (!stats.isSymbolicLink()) {
            // eslint-disable-next-line no-bitwise -- permission bits are a bitmask
            await chmod(path, stats.mode | 0o666);
        }
    }
}

export async function zip(dir: string, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // cross-zip has no cwd option, it zips relative to the process directory
        const cwd = process.cwd();
        process.chdir(dir);
        crossZip.zip(".", fileName, err => {
            process.chdir(cwd);
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export async function unzip(fileName: string, dir: string): Promise<void> {
    return new Promise((resolve, reject) => {
        crossZip.unzip(fileName, dir, err => (err ? reject(err) : resolve()));
    });
}
