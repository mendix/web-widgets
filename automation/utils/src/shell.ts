import crossZip from "cross-zip";
import execa from "execa";
import shelljs from "shelljs";

// shelljs is CommonJS, so named imports are not available under native ESM
const { config } = shelljs;

// Enable fast fail for all shelljs commands
config.fatal = true;
// Only the file system helpers in use are exported; commands run through execa (see exec below).
// KNOWN ISSUES:
// - mv don't throw error  https://github.com/shelljs/shelljs/issues/878
export const { chmod, cp, find, mkdir, mv, rm } = shelljs;
const { ls, popd, pushd } = shelljs;

export function exec(command: string, options?: execa.Options): execa.ExecaChildProcess {
    const { stdio = "inherit", ...execaOptions } = options ?? {};

    return execa(command, { shell: true, stdio, ...execaOptions });
}

export function ensureFileExists(file: string): void {
    const silentState = config.silent;
    config.silent = true;
    ls(file);
    config.silent = silentState;
}

export async function zip(dir: string, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // cross-zip has no cwd option, it zips relative to the process directory
        pushd("-q", dir);
        crossZip.zip(".", fileName, err => {
            popd("-q");
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
