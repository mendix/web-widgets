import { prompt } from "enquirer";
import { oraPromise } from "./cli-utils";
import { exec, find, mkdir, cp } from "./shell";

type DependencyName = string;

type DependencyMeta = {
    from: string;
    version: string;
    resolved?: string;
};

export interface PackageListing {
    name: string;
    version: string;
    path: string;
    private: boolean;
    dependencies: Record<DependencyName, DependencyMeta>;
    devDependencies: Record<DependencyName, DependencyMeta>;
}

export async function listPackages(packageNames: string[]): Promise<PackageListing[]> {
    const pnpmCommand = `pnpm ls --json`;
    const filters = packageNames.map(name => `--filter ${name}`);
    const command = [pnpmCommand, ...filters].join(" ");
    const result = (await exec(command, { stdio: "pipe" })).stdout.trim();
    const data = <PackageListing[]>JSON.parse(result !== "" ? result : "[]");
    return data;
}

export async function getMpkPaths(packageNames: string[]): Promise<string[]> {
    const packages = await listPackages(packageNames);
    const paths = [...find(packages.map(p => `${p.path}/dist/${p.version}/*.mpk`))];
    return paths;
}

export async function copyMpkFiles(packageNames: string[], dest: string): Promise<void> {
    const paths = await getMpkPaths(packageNames);
    mkdir("-p", dest);
    cp(paths, dest);
}

export async function selectPackage(): Promise<PackageListing> {
    const pkgs = await oraPromise(listPackages(["'*'", "!web-widgets"]), "Loading packages...");

    const { packageName } = await prompt<{ packageName: string }>({
        type: "autocomplete",
        name: "packageName",
        message: "Please select package",
        choices: pkgs.map(pkg => pkg.name)
    });

    const pkg = pkgs.find(p => p.name === packageName);

    if (!pkg) {
        throw new Error(`Unable to find package meta for ${packageName}`);
    }

    return pkg;
}
