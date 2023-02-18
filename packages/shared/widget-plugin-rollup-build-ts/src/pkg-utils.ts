import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";

export interface PackageJsonFileContent {
    name?: string;
    mxpackage: {
        name: string;
        type: "module" | "widget" | "jsactoins";
        mpkName: string;
        dependencies?: string[];
    };
    license: string;
    moduleFolderNameInModeler?: string;
    version: string;
    private?: boolean;
    config?: Record<string, unknown>;

    repository?: {
        type: "git";
        url: string;
    };

    marketplace?: {
        minimumMXVersion: string;
        appName?: string;
        appNumber?: number;
    };

    testProject?: {
        githubUrl: string;
        branchName: string;
    };

    packagePath: string;
}

export function getPackageFileContentSync(rootDir: string): PackageJsonFileContent {
    const json = readFileSync(resolvePath(rootDir, "package.json"), { encoding: "utf-8" });
    const pkg: PackageJsonFileContent = JSON.parse(json);

    if (!pkg.packagePath || !pkg.mxpackage?.name || !pkg.version) {
        throw new Error("Missing required fields!");
    }

    return pkg;
}
