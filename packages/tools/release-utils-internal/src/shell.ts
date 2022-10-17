import execa from "execa";
import { config } from "shelljs";

// Enable fast fail for all shelljs commands
config.fatal = true;
export { config as shelljsConfig };

// Export all except exec as we will execa to execute commands
// KNOWN ISSUES:
// - mv don't throw error  https://github.com/shelljs/shelljs/issues/878
export {
    cat,
    cd,
    chmod,
    cp,
    dirs,
    pushd,
    popd,
    echo,
    tempdir,
    pwd,
    ls,
    find,
    grep,
    head,
    ln,
    mkdir,
    rm,
    mv,
    sed,
    set,
    sort,
    tail,
    test,
    touch,
    uniq,
    which,
    exit,
    error,
    env
} from "shelljs";

export function exec(command: string, options?: execa.Options): execa.ExecaChildProcess {
    const { stdio = "inherit", ...execaOptions } = options ?? {};

    return execa(command, { shell: true, stdio, ...execaOptions });
}

export async function zip(src: string, fileName: string): Promise<string> {
    const { stdout } = await exec(`cd "${src}" && zip -r ${fileName} .`, { stdio: "pipe" });
    return stdout.trim();
}

export async function unzip(src: string, dest: string): Promise<string> {
    const { stdout } = await exec(`unzip "${src}" -d "${dest}"`, { stdio: "pipe" });
    return stdout.trim();
}
