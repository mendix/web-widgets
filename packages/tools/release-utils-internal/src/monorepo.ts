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
    const filters = packageNames.map(name => `--filter '${name}'`);
    const command = [pnpmCommand, ...filters].join(" ");
    const result = (await exec(command)).stdout.trim();
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
