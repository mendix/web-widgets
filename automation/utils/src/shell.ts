import crossZip from "cross-zip";
import execa from "execa";
import { config, ls, popd, pushd } from "shelljs";

// Enable fast fail for all shelljs commands
config.fatal = true;
// Export all except exec as we will execa to execute commands
// KNOWN ISSUES:
// - mv don't throw error  https://github.com/shelljs/shelljs/issues/878
export {
    cat,
    cd,
    chmod,
    cp,
    dirs,
    echo,
    env,
    error,
    exit,
    find,
    grep,
    head,
    ln,
    ls,
    mkdir,
    mv,
    popd,
    pushd,
    pwd,
    rm,
    sed,
    set,
    sort,
    tail,
    tempdir,
    test,
    touch,
    uniq,
    which
} from "shelljs";
export { config as shelljsConfig };

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
        pushd("-q", dir);
        crossZip.zip(".", fileName, err => {
            if (err) {
                reject(err);
            } else {
                popd("-q");
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
