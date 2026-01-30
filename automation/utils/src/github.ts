import { mkdtemp, readFile, writeFile } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import nodefetch from "node-fetch";
import { fetch } from "./fetch";
import { exec } from "./shell";

export interface GitHubReleaseAsset {
    id: string;
    name: string;
    browser_download_url: string;
    size: number;
    content_type: string;
    digest: string;
}

export interface GitHubDraftRelease {
    id: string;
    tag_name: string;
    name: string;
    draft: boolean;
    created_at: string;
    published_at: string | null;
    assets: GitHubReleaseAsset[];
}

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
    authToken: string = "";
    owner = "mendix";
    repo = "web-widgets";

    async ensureAuth(): Promise<void> {
        if (!this.authSet) {
            if (process.env.GH_PAT) {
                await exec(`echo "${process.env.GH_PAT}" | gh auth login --with-token`);
            } else {
                // No environment variables set, check if already authenticated
                if (!(await this.isAuthenticated())) {
                    throw new Error(
                        "GitHub CLI is not authenticated. Please set GITHUB_TOKEN or GH_PAT environment variable, or run 'gh auth login'."
                    );
                }
            }

            this.authSet = true;
        }
    }

    private async isAuthenticated(): Promise<boolean> {
        try {
            // Try to run 'gh auth status' to check if authenticated
            await exec("gh auth status", { stdio: "pipe" });
            const { stdout: token } = await exec(`gh auth token`, { stdio: "pipe" });
            this.authToken = token.trim();
            return true;
        } catch (_error: unknown) {
            // If the command fails, the user is not authenticated
            return false;
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

    get ghAPIHeaders(): Record<string, string> {
        return {
            "X-GitHub-Api-Version": "2022-11-28",
            Authorization: `Bearer ${this.authToken || process.env.GH_PAT}`
        };
    }

    async getReleaseIdByReleaseTag(releaseTag: string): Promise<string | undefined> {
        console.log(`Searching for release from Github tag '${releaseTag}'`);
        try {
            const release =
                (await fetch<{ id: string }>(
                    "GET",
                    `https://api.github.com/repos/${this.owner}/${this.repo}/releases/tags/${releaseTag}`,
                    undefined,
                    { ...this.ghAPIHeaders }
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

    async getMPKReleaseAssetUrl(releaseTag: string): Promise<string> {
        const releaseId = await this.getReleaseIdByReleaseTag(releaseTag);
        if (!releaseId) {
            throw new Error(`Could not find release with tag '${releaseTag}' on GitHub`);
        }
        const artifacts = await this.listReleaseAssets(releaseId);

        const downloadUrl = artifacts.find(asset => asset.name.endsWith(".mpk"))?.browser_download_url;

        if (!downloadUrl) {
            throw new Error(`Could not retrieve MPK url from GitHub release with tag ${process.env.TAG}`);
        }

        return downloadUrl;
    }

    async getDraftReleases(): Promise<GitHubDraftRelease[]> {
        const releases = await fetch<GitHubDraftRelease[]>(
            "GET",
            `https://api.github.com/repos/${this.owner}/${this.repo}/releases`,
            undefined,
            {
                ...this.ghAPIHeaders
            }
        );

        // Filter only draft releases
        return releases.filter(release => release.draft);
    }

    async createReleaseNotesFile(releaseNotesText: string): Promise<string> {
        const filePath = await this.createTempFile();
        await writeFile(filePath, releaseNotesText);

        return filePath;
    }

    private async triggerGithubWorkflow(params: {
        workflowId: string;
        ref: string;
        inputs: Record<string, string>;
        owner?: string;
        repo?: string;
    }): Promise<void> {
        await this.ensureAuth();

        const { workflowId, ref, inputs } = params;

        // Convert inputs object to CLI parameters
        const inputParams = Object.entries(inputs)
            .map(([key, value]) => `-f ${key}=${value}`)
            .join(" ");

        const repoParam = `${this.owner}/${this.repo}`;

        const command = [`gh workflow run`, `"${workflowId}"`, `--ref "${ref}"`, inputParams, `-R "${repoParam}"`]
            .filter(Boolean)
            .join(" ");

        try {
            await exec(command);
            console.log(`Successfully triggered workflow '${workflowId}'`);
        } catch (error) {
            throw new Error(`Failed to trigger workflow '${workflowId}': ${error}`);
        }
    }

    async triggerCreateReleaseWorkflow(packageName: string, ref = "main"): Promise<void> {
        return this.triggerGithubWorkflow({
            workflowId: "CreateGitHubRelease.yml",
            ref,
            inputs: {
                package: packageName
            }
        });
    }

    async listReleaseAssets(releaseId: string): Promise<GitHubReleaseAsset[]> {
        return fetch<GitHubReleaseAsset[]>(
            "GET",
            `https://api.github.com/repos/${this.owner}/${this.repo}/releases/${releaseId}/assets`,
            undefined,
            {
                ...this.ghAPIHeaders
            }
        );
    }

    async downloadReleaseAsset(assetId: string, destinationPath: string): Promise<void> {
        await this.ensureAuth();

        const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/assets/${assetId}`;

        try {
            const response = await nodefetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/octet-stream",
                    ...this.ghAPIHeaders
                },
                redirect: "follow"
            });

            if (!response.ok) {
                throw new Error(`Failed to download asset ${assetId}: ${response.status} ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error(`No response body received for asset ${assetId}`);
            }

            // Stream the response body to the file
            const fileStream = createWriteStream(destinationPath);
            await pipeline(response.body, fileStream);
        } catch (error) {
            throw new Error(
                `Failed to download release asset ${assetId}: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Delete a release asset by ID
     */
    async deleteReleaseAsset(assetId: string): Promise<void> {
        await this.ensureAuth();

        const response = await nodefetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/releases/assets/${assetId}`,
            {
                method: "DELETE",
                headers: this.ghAPIHeaders
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to delete asset ${assetId}: ${response.status} ${response.statusText}`);
        }
    }

    /**
     * Upload a new asset to a release
     */
    async uploadReleaseAsset(releaseId: string, filePath: string, assetName: string): Promise<GitHubReleaseAsset> {
        await this.ensureAuth();

        // Get release info to get upload URL
        const release = await fetch<{ upload_url: string }>(
            "GET",
            `https://api.github.com/repos/${this.owner}/${this.repo}/releases/${releaseId}`,
            undefined,
            this.ghAPIHeaders
        );

        // The upload_url comes with {?name,label} template, we need to replace it
        const uploadUrl = release.upload_url.replace(/\{[^}]+}/g, "") + `?name=${encodeURIComponent(assetName)}`;

        // Read the file
        const fileBuffer = await readFile(filePath);

        // Upload the file
        const response = await nodefetch(uploadUrl, {
            method: "POST",
            headers: {
                ...this.ghAPIHeaders,
                "Content-Type": "application/octet-stream",
                "Content-Length": fileBuffer.length.toString()
            },
            body: fileBuffer
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to upload asset ${assetName}: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        return (await response.json()) as GitHubReleaseAsset;
    }

    /**
     * Update a release asset's name
     */
    async updateReleaseAsset(assetId: string, newName: string): Promise<GitHubReleaseAsset> {
        await this.ensureAuth();

        const response = await nodefetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/releases/assets/${assetId}`,
            {
                method: "PATCH",
                headers: {
                    ...this.ghAPIHeaders,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newName })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to update asset ${assetId}: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        return (await response.json()) as GitHubReleaseAsset;
    }
}

export const gh = new GitHub();
