import { exec } from "./shell";

function getGHRepoAuthUrl(repoUrl: string): string {
    const url = new URL(repoUrl);
    const { GH_USERNAME, GH_PAT } = process.env;
    if (!GH_USERNAME || !GH_PAT) {
        throw new Error("Required GH_USERNAME and GH_PAT env vars are not set.");
    }

    url.username = GH_USERNAME;
    url.password = GH_PAT;

    return url.toString();
}

type CloneParams = {
    remoteUrl: string;
    localFolder: string;
    branch?: string;
};

export async function cloneRepo({ remoteUrl, localFolder, branch }: CloneParams): Promise<void> {
    const options = [getGHRepoAuthUrl(remoteUrl), branch ? `--branch=${branch}` : "", localFolder].filter(Boolean);

    await exec(`git clone ${options.join(" ")}`);
    await setLocalGitUserInfo(localFolder);
}
export async function cloneRepoShallow({ remoteUrl, localFolder, branch }: CloneParams): Promise<void> {
    const options = [
        getGHRepoAuthUrl(remoteUrl),
        branch ? `--branch=${branch}` : "",
        `--depth=1`,
        `--single-branch`,
        localFolder
    ].filter(Boolean);

    await exec(`git clone ${options.join(" ")}`);
    await setLocalGitUserInfo(localFolder);
}

export async function setLocalGitUserInfo(workingDirectory?: string): Promise<void> {
    const { GH_NAME, GH_EMAIL } = process.env;
    if (!GH_NAME || !GH_EMAIL) {
        throw new Error("Required GH_NAME and GH_EMAIL env vars are not set.");
    }
    await exec(`git config user.name "${GH_NAME}"`, { cwd: workingDirectory });
    await exec(`git config user.email "${GH_EMAIL}"`, { cwd: workingDirectory });
}

export async function addRemoteWithAuthentication(repoUrl: string, remoteName: string): Promise<void> {
    await setLocalGitUserInfo();

    await exec(`git remote add "${remoteName}" "${getGHRepoAuthUrl(repoUrl)}"`);
}
