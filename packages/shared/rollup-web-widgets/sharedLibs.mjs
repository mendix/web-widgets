// Builds shared libraries once per version at com/mendix/shared/<lib>/<version>/ and points widget bundles at them.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, posix, relative, sep } from "node:path";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import license from "rollup-plugin-license";
import { licenseCustomTemplate } from "@mendix/pluggable-widgets-tools/configs/helpers/rollup-helper.mjs";

const require = createRequire(import.meta.url);

/** `deps`: other shared libraries this one imports. */
const LIBRARIES = {
    mobx: { deps: [] },
    "mobx-react-lite": { deps: ["mobx"] }
};

export const DEFAULT_SHARED_LIBS = ["mobx", "mobx-react-lite"];

/** Provided by the Mendix client. */
const PLATFORM_EXTERNAL = [/^mendix($|\/)/, /^react$/, /^react\/jsx-runtime$/, /^react-dom$/, /^big.js$/];

/** PWT output root, zipped into the MPK. */
const OUT_DIR = join("dist", "tmp", "widgets");
const SHARED_DIR = join("com", "mendix", "shared");

/**
 * @param {{ configProduction?: unknown }} args
 * @param {import("rollup").RollupOptions[]} configs
 * @param {string[]} [libs]
 * @returns {import("rollup").RollupOptions[]}
 */
export function withSharedLibs(args, configs, libs = DEFAULT_SHARED_LIBS) {
    const production = Boolean(args.configProduction);
    const shared = libs.map(name => describeLibrary(name, libs));

    const widgetEntries = configs.filter(isWidgetEntry);
    if (widgetEntries.length === 0) {
        throw new Error("withSharedLibs: no widget AMD/ESM entries found in the given configs.");
    }
    for (const config of widgetEntries) {
        config.plugins = [...asArray(config.plugins), sharedLibsConsumer(shared)];
    }

    // Shared bundles first: the last config zips the MPK.
    const byName = new Map(shared.map(lib => [lib.name, lib]));
    return [...shared.map(lib => sharedLibBundle(lib, byName, production)), ...configs];
}

/** Runtime bundles only; editorPreview/editorConfig run in Studio Pro and keep bundling. */
function isWidgetEntry(config) {
    const format = config.output?.format;
    return !Array.isArray(config.output) && (format === "amd" || format === "es");
}

function describeLibrary(name, selected) {
    const library = LIBRARIES[name];
    if (!library) {
        throw new Error(`withSharedLibs: unknown library "${name}", known: ${Object.keys(LIBRARIES).join(", ")}.`);
    }
    for (const dep of library.deps) {
        if (!selected.includes(dep)) {
            throw new Error(`withSharedLibs: "${name}" requires "${dep}" to be shared as well.`);
        }
    }
    // Built from this package's (patched) copy so every widget emits identical files.
    const pkgJsonPath = require.resolve(`${name}/package.json`);
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    const dir = join(SHARED_DIR, name, pkg.version);
    return {
        name,
        version: pkg.version,
        deps: library.deps,
        input: join(dirname(pkgJsonPath), pkg.module ?? pkg.main),
        dir,
        amdFile: join(dir, "amd", `${name}.js`),
        esmFile: join(dir, "esm", `${name}.mjs`)
    };
}

/** Relative import from `fromFile` to `toFile` (both relative to OUT_DIR). */
function importPath(fromFile, toFile) {
    const rel = relative(dirname(fromFile), toFile).split(sep).join(posix.sep);
    return rel.startsWith(".") ? rel : `./${rel}`;
}

function fileFor(lib, format) {
    return format === "es" ? lib.esmFile : lib.amdFile;
}

/** Standalone AMD + ESM bundle for one library. */
function sharedLibBundle(lib, byName, production) {
    const output = format => {
        const file = fileFor(lib, format);
        const paths = {};
        for (const dep of lib.deps) {
            paths[dep] = importPath(file, fileFor(byName.get(dep), format));
        }
        return { format, file: join(OUT_DIR, file), paths };
    };

    return {
        input: lib.input,
        external: [...PLATFORM_EXTERNAL, ...lib.deps],
        plugins: [
            nodeResolve({ preferBuiltins: false, mainFields: ["module", "browser", "main"] }),
            commonjs(),
            replace({
                preventAssignment: true,
                values: { "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development") }
            }),
            production ? terser() : null,
            production
                ? license({
                      thirdParty: {
                          includePrivate: true,
                          output: [
                              { file: join(OUT_DIR, lib.dir, "dependencies.txt") },
                              { file: join(OUT_DIR, lib.dir, "dependencies.json"), template: licenseCustomTemplate }
                          ]
                      }
                  })
                : null
        ],
        output: [output("es"), output("amd")]
    };
}

/** Externalizes shared libraries; paths come from the final output file, so moved outputs (maps-web) work. */
function sharedLibsConsumer(shared) {
    const byName = new Map(shared.map(lib => [lib.name, lib]));
    /** @type {Map<string, Set<string>>} */
    const importers = new Map();

    return {
        name: "mendix-shared-libs",

        options(options) {
            const original = options.external;
            return {
                ...options,
                external(id, importer, isResolved) {
                    if (!isResolved && byName.has(id)) {
                        if (importer) {
                            if (!importers.has(id)) {
                                importers.set(id, new Set());
                            }
                            importers.get(id).add(importer);
                        }
                        return true;
                    }
                    return isExternal(original, id, importer, isResolved);
                }
            };
        },

        buildEnd() {
            // Widget must compile against the version it runs with.
            for (const [name, files] of importers) {
                const expected = byName.get(name).version;
                for (const importer of files) {
                    const actual = installedVersion(name, importer);
                    if (actual && actual !== expected) {
                        this.error(
                            `"${name}" resolves to ${actual} from ${importer}, but the shared bundle is ${expected}. ` +
                                `Align the version with @mendix/rollup-web-widgets.`
                        );
                    }
                }
            }
        },

        outputOptions(output) {
            if (typeof output.paths === "function") {
                throw new Error("withSharedLibs: output.paths as a function is not supported.");
            }
            const widgetFile = relative(OUT_DIR, output.file);
            if (widgetFile.startsWith("..")) {
                throw new Error(`withSharedLibs: widget output ${output.file} is outside of ${OUT_DIR}.`);
            }
            const paths = { ...output.paths };
            for (const lib of shared) {
                paths[lib.name] = importPath(widgetFile, fileFor(lib, output.format));
            }
            return { ...output, paths };
        }
    };
}

function isExternal(external, id, importer, isResolved) {
    if (typeof external === "function") {
        return external(id, importer, isResolved);
    }
    return asArray(external).some(pattern => (pattern instanceof RegExp ? pattern.test(id) : pattern === id));
}

function installedVersion(name, importer) {
    try {
        let dir = dirname(createRequire(importer).resolve(name));
        while (dir !== dirname(dir)) {
            try {
                const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
                if (pkg.name === name) {
                    return pkg.version;
                }
            } catch {
                // no package.json here
            }
            dir = dirname(dir);
        }
    } catch {
        // not resolvable, nothing to compare
    }
    return undefined;
}

function asArray(value) {
    if (value == null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}
