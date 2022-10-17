import { exec } from "./shell";

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
