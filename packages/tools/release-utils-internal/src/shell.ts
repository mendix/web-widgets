import execa from "execa";
import { config } from "shelljs";

// Enable fast fail for all shelljs commands
config.fatal = true;
export { config as shelljsConfig };

// Export all except exec as we will execa to execute commands
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

interface ExecOptions extends execa.Options {
    silent?: boolean;
}

export function exec(command: string, options?: ExecOptions): execa.ExecaChildProcess {
    const { silent, ...execaOptions } = options ?? {};
    const stdio: execa.Options["stdio"] = silent ? "pipe" : "inherit";

    return execa(command, { shell: true, stdio, ...execaOptions });
}

export async function zip(src: string, fileName: string): Promise<string> {
    const { stdout } = await exec(`cd "${src}" && zip -r ${fileName} .`);
    return stdout.trim();
}

export async function unzip(src: string, dest: string): Promise<string> {
    const { stdout } = await exec(`unzip "${src}" -d "${dest}"`);
    return stdout.trim();
}
