import c from "chalk";
import sh from "shelljs";
import { runReleaseScript, packageMeta } from "./utils.mjs";

export async function updateWidget() {
    const { mkdir, cp, ls } = sh;
    const { version } = packageMeta;
    const mpkPath = `dist/${version}/*.mpk`;
    const outDir = "tests/testProject/widgets";

    if (ls(mpkPath).length) {
        console.log(c.yellow("Widget mpk exists, skip release"));
    } else {
        await runReleaseScript();
    }

    mkdir("-p", outDir);
    cp("-f", mpkPath, outDir);
}
