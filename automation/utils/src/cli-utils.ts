import ora from "ora";
import chalk from "chalk";

export async function oraPromise<T>(task: Promise<T>, msg: string): Promise<T> {
    const spinner = ora(msg);
    spinner.start();
    const r = await task;
    spinner.stop();
    return r;
}

export function printGithubAuthHelp(error: string): void {
    console.log(chalk.red(`❌ GitHub authentication failed: ${error}`));
    console.log(chalk.yellow("\n💡 First, make sure GitHub CLI is installed:"));
    console.log(chalk.cyan("   Download from: https://cli.github.com/"));
    console.log(chalk.cyan("   Or install via brew: brew install gh"));
    console.log(chalk.yellow("\n💡 Then authenticate with GitHub using one of these options:"));
    console.log(chalk.yellow("   1. Set GITHUB_TOKEN environment variable:"));
    console.log(chalk.cyan("      export GITHUB_TOKEN=your_token_here"));
    console.log(chalk.yellow("   2. Set GH_PAT environment variable:"));
    console.log(chalk.cyan("      export GH_PAT=your_token_here"));
    console.log(chalk.yellow("   3. Use GitHub CLI to authenticate:"));
    console.log(chalk.cyan("      gh auth login"));
    console.log(chalk.yellow("\n   Get a token at: https://github.com/settings/tokens"));
}
