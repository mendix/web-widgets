import { exec } from "./shell";
import { fetch } from "./fetch";
import { mkdtemp, writeFile } from "fs/promises";
import { join } from "path";

interface GitHubReleaseInfo {
    title: string;
    tag: string;
    target: string;
    notes:
        | {
              text: string;
          }
        | {
              file: string;
          };
    filesToRelease?: string;
    isDraft?: boolean;
    repo?: string;
}
interface GitHubPRInfo {
    title: string;
    body: string;
    head: string;
    base: string;
    repo?: string;
}

export class GitHub {
    authSet = false;
    tmpPrefix = "gh-";

    private async ensureAuth(): Promise<void> {
        if (!this.authSet) {
            await exec(`echo "${process.env.GH_PAT}" | gh auth login --with-token`);
        }
    }

    async createTempFile(): Promise<string> {
        const dir = await mkdtemp(this.tmpPrefix);
        return join(dir, "release-notes.txt");
    }

    async createGithubPRFrom(pr: GitHubPRInfo): Promise<void> {
        await this.ensureAuth();

        const repoArgument = pr.repo ? `--repo '${pr.repo}'` : "";
        const command = [
            `gh pr create`,
            `--title '${pr.title}'`,
            `--body '${pr.body}'`,
            `--base '${pr.base}'`,
            `--head '${pr.head}'`,
            repoArgument
        ].join(" ");

        await exec(command);
    }

    async createGithubReleaseFrom(params: GitHubReleaseInfo): Promise<void> {
        const { notes, title, tag, filesToRelease = "", target, isDraft = false, repo } = params;
        await this.ensureAuth();

        const notesFilePath = "file" in notes ? notes.file : await this.createReleaseNotesFile(notes.text);

        const targetHash = (await exec(`git rev-parse --verify ${target}`, { stdio: "pipe" })).stdout.trim();
        const command = [
            `gh release create`,
            `--title '${title}'`,
            `--notes-file '${notesFilePath}'`,
            isDraft ? `--draft` : "",
            repo ? `-R '${repo}'` : "",
            `'${tag}'`,
            `--target '${targetHash}'`,
            filesToRelease ? `'${filesToRelease}'` : ""
        ]
            .filter(str => str !== "")
            .join(" ");

        await exec(command);
    }

    async getReleaseIdByReleaseTag(releaseTag: string): Promise<string | undefined> {
        console.log(`Searching for release from Github tag '${releaseTag}'`);
        try {
            const release =
                (await fetch<{ id: string }>(
                    "GET",
                    `https://api.github.com/repos/mendix/web-widgets/releases/tags/${releaseTag}`
                )) ?? [];

            if (!release) {
                return undefined;
            }

            return release.id;
        } catch (e) {
            if (e instanceof Error && e.message.includes("404")) {
                return undefined;
            }

            throw e;
        }
    }

    async getReleaseArtifacts(releaseTag: string): Promise<Array<{ name: string; browser_download_url: string }>> {
        const releaseId = await this.getReleaseIdByReleaseTag(releaseTag);

        if (!releaseId) {
            throw new Error(`Could not find release with tag '${releaseTag}' on GitHub`);
        }

        return fetch<
            Array<{
                name: string;
                browser_download_url: string;
            }>
        >("GET", `https://api.github.com/repos/mendix/web-widgets/releases/${releaseId}/assets`);
    }

    async getMPKReleaseArtifactUrl(releaseTag: string): Promise<string> {
        const artifacts = await this.getReleaseArtifacts(releaseTag);

        const downloadUrl = artifacts.find(asset => asset.name.endsWith(".mpk"))?.browser_download_url;

        if (!downloadUrl) {
            throw new Error(`Could not retrieve MPK url from GitHub release with tag ${process.env.TAG}`);
        }

        return downloadUrl;
    }

    async createReleaseNotesFile(releaseNotesText: string): Promise<string> {
        const filePath = await this.createTempFile();
        await writeFile(filePath, releaseNotesText);

        return filePath;
    }
}

export const gh = new GitHub();
