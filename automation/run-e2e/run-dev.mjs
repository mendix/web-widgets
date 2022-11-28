import { execSync } from "node:child_process";
// import { relativeToModule } from "../utils.mjs";

export async function runDev() {
    console.log("Run dev");
    // execSync("echo $PATH", {stdio: 'inherit'});
    // const __dirname = fileURLToPath(new URL(".", import.meta.url));
    // const configPath = relativeToModule("cypress.config.js", import.meta.url);
    // console.log(configPath);
    const command = [`cypress open`, `--browser chrome`, `--e2e`, `--config-file cypress.config.cjs`].join(" ");
    console.log(command);


    execSync(command, { stdio: 'inherit' })
}
