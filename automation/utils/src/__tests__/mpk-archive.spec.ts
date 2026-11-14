// Runs the release steps that unzip an mpk, change it and zip it back, against the real
// zip tooling of the machine (`zip`/`unzip` on Linux and macOS, PowerShell on Windows).
// CI runs these on the same runners as the release build.
import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { includeReadmeOssIntoMpk } from "../oss-clearance.ts";
import { readXml } from "../package-xml.ts";
import { unzip, zip } from "../shell.ts";
import { addTestProjectWidgetsToMpk, copyFilesToMpk, type ModuleStepParams } from "../steps.ts";

let tmp: string;

beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "automation-utils-mpk-"));
});

afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
});

const MODULE_PACKAGE_XML = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.mendix.com/package/1.0/">
    <modelerProject name="DataWidgets" version="1.0.0">
        <files>
            <file path="themesource/datawidgets/web/main.scss"/>
        </files>
    </modelerProject>
</package>
`;

async function writeTree(root: string, files: Record<string, string | Buffer>): Promise<void> {
    for (const [path, content] of Object.entries(files)) {
        await mkdir(join(root, path, ".."), { recursive: true });
        await writeFile(join(root, path), content);
    }
}

/** A module mpk like the one mxbuild creates, with a read-only file inside. */
async function createModuleMpk(mpk: string): Promise<void> {
    const content = join(tmp, "module-content");
    await writeTree(content, {
        "package.xml": MODULE_PACKAGE_XML,
        "DataWidgets.mpr": "mpr",
        "themesource/datawidgets/web/main.scss": "// styles"
    });
    if (process.platform !== "win32") {
        // mxbuild output is read-only; the steps must still be able to rewrite the archive
        await chmod(join(content, "themesource", "datawidgets", "web", "main.scss"), 0o444);
    }
    await zip(content, mpk);
    await rm(content, { recursive: true, force: true });
}

/** A widget mpk: a zip archive with binary content, nested inside the module mpk. */
async function createWidgetMpk(mpk: string): Promise<Buffer> {
    const content = join(tmp, "widget-content");
    await writeTree(content, {
        "package.xml": "<package/>",
        "com/mendix/widget/web/Gallery.js": "export {}"
    });
    await zip(content, mpk);
    await rm(content, { recursive: true, force: true });
    return readFile(mpk);
}

async function listArchive(mpk: string): Promise<string[]> {
    const target = await mkdtemp(join(tmp, "list-"));
    await unzip(mpk, target);
    return readdirSync(target, { recursive: true, encoding: "utf-8" })
        .filter(entry => statSync(join(target, entry)).isFile())
        .map(entry => entry.replaceAll("\\", "/"))
        .sort();
}

async function readFromArchive(mpk: string, entry: string): Promise<Buffer> {
    const target = await mkdtemp(join(tmp, "read-"));
    await unzip(mpk, target);
    return readFile(join(target, entry));
}

async function packageXmlFiles(mpk: string): Promise<string[]> {
    const target = await mkdtemp(join(tmp, "xml-"));
    await unzip(mpk, target);
    const xml = (await readXml(join(target, "package.xml"))) as any;
    const file = xml.package.modelerProject.files.file;
    return (Array.isArray(file) ? file : [file]).map(f => f["@_path"]);
}

function moduleStepParams(config: object): ModuleStepParams {
    return { config } as unknown as ModuleStepParams;
}

describe("addTestProjectWidgetsToMpk", () => {
    it("adds the widget mpks to the module mpk and lists them in package.xml", async () => {
        const mpk = join(tmp, "build", "DataWidgets.mpk");
        const widgets = join(tmp, "widgets");
        await mkdir(join(tmp, "build"));
        await mkdir(widgets);
        await createModuleMpk(mpk);
        const gallery = await createWidgetMpk(join(widgets, "Gallery.mpk"));
        await createWidgetMpk(join(widgets, "Tree Node.mpk"));

        await addTestProjectWidgetsToMpk(["Gallery.mpk", "Tree Node.mpk"])(
            moduleStepParams({ output: { files: { modulePackage: mpk }, dirs: { widgets } } })
        );

        assert.deepEqual(await listArchive(mpk), [
            "DataWidgets.mpr",
            "package.xml",
            "themesource/datawidgets/web/main.scss",
            "widgets/Gallery.mpk",
            "widgets/Tree Node.mpk"
        ]);
        assert.deepEqual(await packageXmlFiles(mpk), [
            "themesource/datawidgets/web/main.scss",
            "widgets/Gallery.mpk",
            "widgets/Tree Node.mpk"
        ]);
        assert.deepEqual(await readFromArchive(mpk, "widgets/Gallery.mpk"), gallery);
        assert.deepEqual(readdirSync(join(tmp, "build")), ["DataWidgets.mpk"], "temp folder is removed");
    });
});

describe("copyFilesToMpk", () => {
    it("copies the files into the mpk and lists them in package.xml", async () => {
        const pkg = join(tmp, "package");
        const mpk = join(pkg, "dist", "DataWidgets.mpk");
        await writeTree(pkg, { "src/javascriptsource/actions/Action.js": "action" });
        await mkdir(join(pkg, "dist"));
        await createModuleMpk(mpk);

        await copyFilesToMpk(
            [
                {
                    filePath: join("src", "javascriptsource", "actions", "Action.js"),
                    pkgPath: "javascriptsource/Action.js"
                }
            ],
            "modelerProject"
        )(moduleStepParams({ paths: { package: pkg, tmp: join(pkg, "tmp") }, output: { files: { mpk } } }));

        assert.deepEqual(await listArchive(mpk), [
            "DataWidgets.mpr",
            "javascriptsource/Action.js",
            "package.xml",
            "themesource/datawidgets/web/main.scss"
        ]);
        assert.deepEqual(await packageXmlFiles(mpk), [
            "themesource/datawidgets/web/main.scss",
            "javascriptsource/Action.js"
        ]);
        assert.equal(existsSync(join(pkg, "tmp", "copyfiles_tmp")), false, "temp folder is removed");
    });
});

describe("includeReadmeOssIntoMpk", () => {
    it("adds the READMEOSS file to the mpk in place", async () => {
        const mpk = join(tmp, "dist", "DataWidgets.mpk");
        const readme = join(tmp, "DataWidgets__3.0.0__READMEOSS_2026-01-01.html");
        await mkdir(join(tmp, "dist"));
        await createModuleMpk(mpk);
        await writeFile(readme, "<html/>");

        await includeReadmeOssIntoMpk(readme, mpk);

        assert.deepEqual(await listArchive(mpk), [
            "DataWidgets.mpr",
            "DataWidgets__3.0.0__READMEOSS_2026-01-01.html",
            "package.xml",
            "themesource/datawidgets/web/main.scss"
        ]);
        assert.deepEqual(readdirSync(join(tmp, "dist")), ["DataWidgets.mpk"], "temp folder is removed");
    });
});
