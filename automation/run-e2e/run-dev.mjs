import { spawnSync } from "node:child_process";
import { delimiter } from "node:path";

export async function runDev() {
    console.log("Run e2e as dev");
    // execSync("echo $PATH", {stdio: 'inherit'});
    // const __dirname = fileURLToPath(new URL(".", import.meta.url));
    // const configPath = relativeToModule("cypress.config.js", import.meta.url);
    // console.log(configPath);
    const command = [`cypress open`, `--browser chrome`, `--e2e`, `--config-file cypress.config.cjs`].join(" ");
    console.log(command);

    execSync(command, { stdio: "inherit" });
}
