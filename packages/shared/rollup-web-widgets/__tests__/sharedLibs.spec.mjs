import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";
import license from "rollup-plugin-license";
import { licenseCustomTemplate } from "@mendix/pluggable-widgets-tools/configs/helpers/rollup-helper.mjs";
import { withSharedLibs } from "../sharedLibs.mjs";

const OUT = join("dist", "tmp", "widgets");
const MOBX_ESM = "shared/mobx/6.12.3/esm/mobx.mjs";
const MOBX_AMD = "shared/mobx/6.12.3/amd/mobx.js";

function widgetConfigs(dir = "com/mendix/widget/web/datagrid") {
    return [
        { input: "src/W.tsx", output: { format: "amd", file: join(OUT, dir, "W.js") }, plugins: [] },
        { input: "src/W.tsx", output: { format: "es", file: join(OUT, dir, "W.mjs") }, plugins: [] },
        { input: "src/W.editorPreview.tsx", output: { format: "commonjs", file: join(OUT, "W.editorPreview.js") } },
        { input: "src/W.editorConfig.ts", output: { format: "commonjs", file: join(OUT, "W.editorConfig.js") } }
    ];
}

const consumerOf = config => config.plugins.find(p => p.name === "mendix-shared-libs");
const pathsFor = config => consumerOf(config).outputOptions(config.output).paths;

describe("withSharedLibs", () => {
    it("prepends shared bundles and only changes the runtime entries", () => {
        const configs = withSharedLibs({}, widgetConfigs());

        assert.equal(configs.length, 6);
        assert.match(configs[0].output[0].file, /shared\/mobx\/6\.12\.3\/esm\/mobx\.mjs$/);
        assert.match(configs[1].output[0].file, /shared\/mobx-react-lite\/4\.0\.7\/esm\/mobx-react-lite\.mjs$/);
        assert.ok(consumerOf(configs[2]) && consumerOf(configs[3]));
        assert.equal(configs[4].plugins, undefined);
        assert.equal(configs[5].plugins, undefined);
    });

    it("points widget imports at the shared bundles", () => {
        const [, , amd, esm] = withSharedLibs({}, widgetConfigs());

        assert.equal(pathsFor(esm).mobx, `../../../${MOBX_ESM}`);
        assert.equal(pathsFor(amd).mobx, `../../../${MOBX_AMD}`);
    });

    it("computes paths from the final output file (maps-web moves it)", () => {
        const [, , amd, esm] = withSharedLibs({}, widgetConfigs());
        const moved = join(process.cwd(), OUT, "com/mendix/widget/custom/Maps");
        esm.output.file = join(moved, "Maps.mjs");
        amd.output.file = join(moved, "Maps.js");

        assert.equal(pathsFor(esm).mobx, `../../../${MOBX_ESM}`);
        assert.equal(pathsFor(amd)["mobx-react-lite"], "../../../shared/mobx-react-lite/4.0.7/amd/mobx-react-lite.js");
    });

    it("points mobx-react-lite at the shared mobx", () => {
        const [, mrl] = withSharedLibs({}, widgetConfigs());

        assert.ok(mrl.external.includes("mobx"));
        assert.equal(mrl.output[0].paths.mobx, "../../../mobx/6.12.3/esm/mobx.mjs");
        assert.equal(mrl.output[1].paths.mobx, "../../../mobx/6.12.3/amd/mobx.js");
    });

    it("keeps the widget's own externals", () => {
        const configs = widgetConfigs();
        configs[1].external = [/^react$/];
        const esm = withSharedLibs({}, configs)[3];
        const { external } = consumerOf(esm).options(esm);

        assert.equal(external("mobx", "/src/W.tsx", false), true);
        assert.equal(external("react", "/src/W.tsx", false), true);
        assert.equal(external("classnames", "/src/W.tsx", false), false);
    });

    it("rejects unknown libraries and missing shared dependencies", () => {
        assert.throws(() => withSharedLibs({}, widgetConfigs(), ["lodash"]), /unknown library "lodash"/);
        assert.throws(() => withSharedLibs({}, widgetConfigs(), ["mobx-react-lite"]), /requires "mobx"/);
        assert.throws(() => withSharedLibs({}, widgetConfigs().slice(2)), /no widget AMD\/ESM entries/);
    });

    describe("version check", () => {
        const root = mkdtempSync(join(tmpdir(), "shared-libs-"));
        after(() => rmSync(root, { recursive: true, force: true }));

        function importerWithMobx(version) {
            const dir = join(root, version);
            mkdirSync(join(dir, "node_modules", "mobx"), { recursive: true });
            mkdirSync(join(dir, "src"), { recursive: true });
            writeFileSync(
                join(dir, "node_modules", "mobx", "package.json"),
                JSON.stringify({ name: "mobx", version, main: "index.js" })
            );
            writeFileSync(join(dir, "node_modules", "mobx", "index.js"), "");
            return join(dir, "src", "W.tsx");
        }

        function build(importer) {
            const esm = withSharedLibs({}, widgetConfigs())[3];
            const plugin = consumerOf(esm);
            plugin.options(esm).external("mobx", importer, false);
            plugin.buildEnd.call({
                error: message => {
                    throw new Error(message);
                }
            });
        }

        it("fails when a widget resolves another mobx version", () => {
            assert.throws(() => build(importerWithMobx("6.13.0")), /resolves to 6\.13\.0 .* shared bundle is 6\.12\.3/);
        });

        it("passes when the versions match", () => {
            assert.doesNotThrow(() => build(importerWithMobx("6.12.3")));
        });
    });

    describe("third-party list at the MPK root (read by mxbuild for the SBOM)", () => {
        const cwd = process.cwd();
        const root = mkdtempSync(join(tmpdir(), "shared-libs-licenses-"));
        const rootJson = () => JSON.parse(readFileSync(join(root, OUT, "dependencies.json"), "utf8"));
        const rootTxt = () => readFileSync(join(root, OUT, "dependencies.txt"), "utf8");
        const names = () => rootJson().map(entry => Object.keys(entry)[0]);

        before(() => {
            writeFileSync(join(root, "package.json"), JSON.stringify({ name: "w", version: "1.0.0" }));
            process.chdir(root);
        });
        after(() => {
            process.chdir(cwd);
            rmSync(root, { recursive: true, force: true });
        });

        function writePackage(name, version) {
            const dir = join(root, "node_modules", name);
            mkdirSync(dir, { recursive: true });
            writeFileSync(
                join(dir, "package.json"),
                JSON.stringify({ name, version, license: "MIT", main: "index.js" })
            );
            writeFileSync(join(dir, "index.js"), `export const ${name.replace(/\W/g, "")} = 1;`);
        }

        /** Mirrors the widget configs PWT generates: the production AMD build writes the root list. */
        function pwtWidgetConfigs(source, production) {
            const dir = "com/mendix/widget/web/w";
            writeFileSync(join(root, "W.js"), source);
            const pwtLicense = license({
                thirdParty: {
                    includePrivate: true,
                    output: [
                        { file: join(root, OUT, "dependencies.txt") },
                        { file: join(root, OUT, "dependencies.json"), template: licenseCustomTemplate }
                    ]
                }
            });
            return [
                {
                    input: join(root, "W.js"),
                    output: { format: "amd", file: join(OUT, dir, "W.js") },
                    plugins: [nodeResolve(), production ? pwtLicense : null]
                },
                {
                    input: join(root, "W.js"),
                    output: { format: "es", file: join(OUT, dir, "W.mjs") },
                    plugins: [nodeResolve()]
                }
            ];
        }

        async function build(source, production = true) {
            rmSync(join(root, "dist"), { recursive: true, force: true });
            for (const config of withSharedLibs(
                { configProduction: production },
                pwtWidgetConfigs(source, production)
            )) {
                const bundle = await rollup({ ...config, onwarn: () => {} });
                for (const output of [config.output].flat()) {
                    await bundle.write(output);
                }
                await bundle.close();
            }
        }

        it("lists the shared libraries next to the widget's own dependencies", async () => {
            writePackage("own-dep", "1.2.3");
            await build(
                `import { owndep } from "own-dep"; import { observable } from "mobx"; import { observer } from "mobx-react-lite"; console.log(owndep, observable, observer);`
            );

            assert.deepEqual(names().sort(), ["mobx", "mobx-react-lite", "own-dep"]);
            assert.deepEqual(
                rootJson().find(entry => entry.mobx),
                { mobx: { version: "6.12.3", url: "https://mobx.js.org/" } }
            );
            const txt = rootTxt();
            assert.match(txt, /Name: own-dep\nVersion: 1\.2\.3/);
            assert.match(txt, /Name: mobx\nVersion: 6\.12\.3\nLicense: MIT/);
            assert.match(txt, /Name: mobx-react-lite\nVersion: 4\.0\.7/);
        });

        it("lists the shared libraries when the widget has no dependencies of its own", async () => {
            await build(`import { observable } from "mobx"; console.log(observable);`);

            assert.deepEqual(names(), ["mobx", "mobx-react-lite"]);
            assert.doesNotMatch(rootTxt(), /No third parties dependencies/);
        });

        it("leaves development builds without a root list, like PWT does", async () => {
            await build(`import { observable } from "mobx"; console.log(observable);`, false);

            assert.throws(() => rootJson(), /ENOENT/);
        });
    });
});
