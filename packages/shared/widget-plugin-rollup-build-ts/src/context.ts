import * as dotenv from "dotenv";
import { Bundle, createBundle } from "./bundle.js";
import { getPackageFileContentSync, PackageJsonFileContent } from "./pkg-utils.js";

type EnvVars = {
    production: boolean;
    ci: boolean;
    mpkoutput?: string;
    projectPath?: string;
};

export type Env = Readonly<EnvVars>;

export type Context = {
    rootDir: string;
    env: Env;
    package: PackageJsonFileContent;
    bundle: Bundle;
};

export function context(): Context {
    const rootDir = process.cwd();
    const env = createEnv();
    const pkg = getPackageFileContentSync(rootDir);
    const bundle = createBundle(pkg, "output");

    return {
        rootDir,
        env,
        package: pkg,
        bundle
    };
}

function createEnv(): Env {
    dotenv.config();

    const prod1 = process.env["MODE"] === "production";
    const prod2 = process.env["NODE_ENV"] === "production";
    const mpk = process.env["MPKOUTPUT"];
    const mxProjectPath = process.env["MX_PROJECT_PATH"];

    const env: EnvVars = {
        production: prod1 || prod2,
        ci: !!JSON.parse(process.env["CI"] || "false")
    };

    if (typeof mpk === "string" && mpk !== "") {
        env.mpkoutput = mpk;
    }

    if (typeof mxProjectPath === "string" && mxProjectPath !== "") {
        env.projectPath = mxProjectPath;
    }

    return Object.freeze(env);
}
