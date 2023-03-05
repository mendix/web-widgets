import { resolve as resolvePath } from "node:path";
import depsLicense from "rollup-plugin-license";

export const license = (clientModuleRootDir: string) =>
    depsLicense({
        thirdParty: {
            includePrivate: true,
            output: [
                {
                    file: resolvePath(clientModuleRootDir, "dependencies.txt"),
                    encoding: "utf-8"
                },
                {
                    file: resolvePath(clientModuleRootDir, "dependencies.json"),
                    template: licenseCustomTemplate,
                    encoding: "utf-8"
                }
            ]
        }
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const licenseCustomTemplate = (dependencies: any[]): string =>
    JSON.stringify(
        dependencies.map(dependency => ({
            [dependency.name]: {
                version: dependency.version,
                ...(typeof dependency.isTransitive !== "undefined" ? { transitive: dependency.isTransitive } : null),
                url: dependency.homepage
            }
        })),
        null,
        4
    );
