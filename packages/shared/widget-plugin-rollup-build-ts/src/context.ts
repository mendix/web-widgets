import type { OutputOptions } from "rollup";
import * as dotenv from "dotenv";
import { resolve as resolvePath } from "node:path";
import { existsSync } from "node:fs";
import { Bundle, createBundle } from "./bundle.js";
import { getPackageFileContentSync, PackageJsonFileContent } from "./pkg-utils.js";

export type Context = {
    rootDir: string;
    options: Options;
    config: Config;
    env: Env;
    package: PackageJsonFileContent;
    bundle: Bundle;
};

export function context(opt?: ConfigOptions): Context {
    const rootDir = process.cwd();
    const options = getOptions(opt);
    const env = createEnv();
    const pkg = getPackageFileContentSync(rootDir);
    const config = createConfig(env, pkg, options);
    const bundle = createBundle(env, pkg, options.outDir);

    return {
        rootDir,
        options,
        env,
        package: pkg,
        bundle,
        config
    };
}

type Options = {
    watch: boolean;
    sourcemap: OutputOptions["sourcemap"];
    bundleAnalyzer: boolean;
    outDir: string;
};

export type ConfigOptions = Partial<Options>;

function getOptions(incoming?: ConfigOptions): Options {
    return {
        watch: incoming?.watch ?? false,
        sourcemap: incoming?.sourcemap ?? "inline",
        bundleAnalyzer: incoming?.bundleAnalyzer ?? false,
        outDir: incoming?.outDir ?? "output"
    };
}

type EnvVars = {
    production: boolean;
    ci: boolean;
    mpkoutput?: string;
    projectPath?: string;
};

export type Env = Readonly<EnvVars>;

function createEnv(): Env {
    dotenv.config();

    console.log(process.env);

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

export type Config = {
    projectPath: string | undefined;
    verbose: boolean;
    use: {
        bundleAnalyzer: boolean;
        bundleSize: boolean;
        minify: boolean;
        livereload: boolean;
    };
    plugin: {
        bundleAnalyzer: null;
        bundleSize: null;
    };
};

function createConfig(env: Env, pkg: PackageJsonFileContent, options: Options): Config {
    const projectPath = getProjectPath(env, pkg);
    const verbose = !env.ci && !options.watch;
    const use = {
        bundleAnalyzer: !env.ci && !options.watch && options.bundleAnalyzer,
        minify: env.production,
        bundleSize: !options.watch,
        livereload: projectPath !== undefined && options.watch
    };
    return {
        projectPath,
        verbose,
        use,
        plugin: {
            bundleAnalyzer: null,
            bundleSize: null
        }
    };
}

function getProjectPath(env: Env, pkg: PackageJsonFileContent): string | undefined {
    let path: string;

    if (env.projectPath) {
        path = env.projectPath;
    } else if (typeof pkg.config?.["packagePath"] === "string") {
        path = pkg.config["packagePath"];
    } else {
        path = resolvePath("tests", "testProject");
    }

    return existsSync(path) ? path : undefined;
}
