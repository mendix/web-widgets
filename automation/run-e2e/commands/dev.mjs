import { spawnSync } from "node:child_process";
import { delimiter } from "node:path";
import { fileURLToPath } from "node:url";

export async function dev(options) {
    console.log("Run e2e tests in development environment");
    const packageBinariesPath = fileURLToPath(new URL("../node_modules/.bin", import.meta.url));

    process.env.PATH += `${delimiter}${packageBinariesPath}`;

    const command = "cypress";
    const args = ["open", "--browser", options.browser, "--e2e", "--config-file", "cypress.config.cjs"];

    spawnSync(command, args, { stdio: "inherit", shell: true });
}
