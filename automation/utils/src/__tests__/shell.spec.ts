import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { ensureFileExists, findFiles, makeWritableRecursive, move, unzip, zip } from "../shell.ts";

let tmp: string;

beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "automation-utils-shell-"));
});

afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
});

async function writeTree(root: string, files: Record<string, string>): Promise<void> {
    for (const [path, content] of Object.entries(files)) {
        await mkdir(join(root, path, ".."), { recursive: true });
        await writeFile(join(root, path), content);
    }
}

describe("ensureFileExists", () => {
    it("resolves for an existing file", async () => {
        await writeTree(tmp, { "a.txt": "a" });
        await ensureFileExists(join(tmp, "a.txt"));
    });

    it("rejects with ENOENT for a missing file", async () => {
        await assert.rejects(ensureFileExists(join(tmp, "missing.txt")), { code: "ENOENT" });
    });
});

describe("findFiles", () => {
    it("expands every pattern", async () => {
        await writeTree(tmp, { "a/one.mpk": "", "b/two.mpk": "", "b/other.txt": "" });

        const found = findFiles(join(tmp, "a", "*.mpk"), join(tmp, "b", "*.mpk"));

        assert.deepEqual(found, [join(tmp, "a", "one.mpk"), join(tmp, "b", "two.mpk")]);
    });

    it("throws when a pattern matches nothing", async () => {
        await writeTree(tmp, { "a/one.mpk": "" });

        assert.throws(() => findFiles(join(tmp, "a", "*.mpk"), join(tmp, "b", "*.mpk")), /No files match/);
    });
});

describe("move", () => {
    it("moves a file", async () => {
        await writeTree(tmp, { "src.txt": "content" });

        await move(join(tmp, "src.txt"), join(tmp, "dest.txt"));

        assert.equal(existsSync(join(tmp, "src.txt")), false);
        assert.equal(await readFile(join(tmp, "dest.txt"), "utf-8"), "content");
    });

    it("moves a directory with its contents", async () => {
        await writeTree(tmp, { "src/nested/file.txt": "content" });

        await move(join(tmp, "src"), join(tmp, "dest"));

        assert.equal(existsSync(join(tmp, "src")), false);
        assert.equal(await readFile(join(tmp, "dest", "nested", "file.txt"), "utf-8"), "content");
    });
});

describe("makeWritableRecursive", { skip: process.platform === "win32" && "POSIX permission bits" }, () => {
    it("adds read and write permissions for everyone and keeps other bits", async () => {
        await writeTree(tmp, { "dir/nested/file.txt": "", "dir/script.sh": "" });
        await chmod(join(tmp, "dir", "nested", "file.txt"), 0o400);
        await chmod(join(tmp, "dir", "script.sh"), 0o700);
        await chmod(join(tmp, "dir", "nested"), 0o700);

        await makeWritableRecursive(join(tmp, "dir"));

        const mode = async (path: string): Promise<string> => ((await stat(join(tmp, path))).mode & 0o777).toString(8); // eslint-disable-line no-bitwise
        assert.equal(await mode("dir/nested/file.txt"), "666");
        assert.equal(await mode("dir/script.sh"), "766");
        assert.equal(await mode("dir/nested"), "766");
    });

    it("does not follow symbolic links", async () => {
        await writeTree(tmp, { "outside.txt": "", "dir/file.txt": "" });
        await chmod(join(tmp, "outside.txt"), 0o400);
        await symlink(join(tmp, "outside.txt"), join(tmp, "dir", "link.txt"));

        await makeWritableRecursive(join(tmp, "dir"));

        // eslint-disable-next-line no-bitwise
        assert.equal(((await stat(join(tmp, "outside.txt"))).mode & 0o777).toString(8), "400");
    });
});

describe("zip and unzip", () => {
    it("stores the directory contents at the archive root", async () => {
        await writeTree(tmp, { "content/package.xml": "<package/>", "content/widgets/a.mpk": "a" });
        const archive = join(tmp, "out.mpk");

        await zip(join(tmp, "content"), archive);
        await unzip(archive, join(tmp, "unzipped"));

        assert.deepEqual(readdirSync(join(tmp, "unzipped")).sort(), ["package.xml", "widgets"]);
        assert.equal(await readFile(join(tmp, "unzipped", "widgets", "a.mpk"), "utf-8"), "a");
    });

    it("restores the working directory after zipping", async () => {
        await writeTree(tmp, { "content/a.txt": "a" });
        const cwd = process.cwd();

        await zip(join(tmp, "content"), join(tmp, "out.zip"));

        assert.equal(process.cwd(), cwd);
    });

    it("restores the working directory when zipping fails", async () => {
        await writeTree(tmp, { "content/a.txt": "a" });
        const cwd = process.cwd();

        await assert.rejects(zip(join(tmp, "content"), join(tmp, "missing-dir", "out.zip")));

        assert.equal(process.cwd(), cwd);
    });
});
