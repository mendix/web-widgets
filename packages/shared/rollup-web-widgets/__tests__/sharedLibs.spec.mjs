import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
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
});
