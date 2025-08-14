import nodefetch, { RequestInit } from "node-fetch";

interface JiraVersion {
    id: string;
    name: string;
    archived: boolean;
    released: boolean;
}

interface JiraProject {
    id: string;
    key: string;
    name: string;
}

interface JiraIssue {
    key: string;
    fields: {
        summary: string;
    };
}

export class Jira {
    private projectKey: string;
    private baseUrl: string;
    private apiToken: string;

    private projectId: string | undefined;
    private projectVersions: JiraVersion[] | undefined;

    constructor(projectKey: string, baseUrl: string, apiToken: string) {
        if (!apiToken) {
            throw new Error("API token is required.");
        }
        this.projectKey = projectKey;
        this.baseUrl = baseUrl;

        this.apiToken = Buffer.from(apiToken).toString("base64"); // Convert to Base64
    }

    // Private helper method for making API requests
    private async apiRequest<T = unknown>(
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        endpoint: string,
        body?: object
    ): Promise<T> {
        const url = `${this.baseUrl}/rest/api/3${endpoint}`;
        const headers = { Authorization: `Basic ${this.apiToken}` };

        const httpsOptions: RequestInit = {
            method,
            redirect: "follow",
            headers: {
                Accept: "application/json",
                ...headers,
                ...(body && { "Content-Type": "application/json" })
            },
            body: body ? JSON.stringify(body) : undefined
        };

        let response;
        try {
            response = await nodefetch(url, httpsOptions);
        } catch (error) {
            throw new Error(`API request failed: ${(error as Error).message}`);
        }

        if (!response.ok) {
            throw new Error(`API request failed (${response.status}): ${response.statusText}`);
        }

        if (response.status === 204) {
            // No content, return empty object
            return {} as T;
        }

        return response.json();
    }

    async initializeProjectData(): Promise<void> {
        const projectData = await this.apiRequest<JiraProject & { versions: JiraVersion[] }>(
            "GET",
            `/project/${this.projectKey}`
        );

        this.projectId = projectData.id; // Save project ID
        this.projectVersions = projectData.versions.reverse(); // Save list of versions
    }

    private versions(): JiraVersion[] {
        if (!this.projectVersions) {
            throw new Error("Project versions not initialized. Call initializeProjectData() first.");
        }
        return this.projectVersions;
    }

    getVersions(): JiraVersion[] {
        return this.versions();
    }

    findVersion(versionName: string): JiraVersion | undefined {
        return this.versions().find(version => version.name === versionName);
    }

    async createVersion(name: string): Promise<JiraVersion> {
        const version = await this.apiRequest<JiraVersion>("POST", `/version`, {
            projectId: this.projectId,
            name
        });

        this.projectVersions!.unshift(version);

        return version;
    }

    async assignVersionToIssue(versionId: string, issueKey: string): Promise<void> {
        const currentVersions = await this.getFixVersionsForIssue(issueKey);
        if (currentVersions.some(version => version.id === versionId)) {
            // Version already exists
            return;
        }

        const updatedVersions = [...currentVersions.map(version => ({ id: version.id })), { id: versionId }];

        await this.apiRequest("PUT", `/issue/${issueKey}`, {
            fields: {
                fixVersions: updatedVersions
            }
        });
    }

    async deleteVersion(versionId: string): Promise<void> {
        await this.apiRequest("DELETE", `/version/${versionId}`);

        // Remove the version from the cached project versions
        this.projectVersions = this.projectVersions?.filter(version => version.id !== versionId);
    }

    async getFixVersionsForIssue(issueKey: string): Promise<JiraVersion[]> {
        const issue = await this.apiRequest<{ fields: { fixVersions: JiraVersion[] } }>(
            "GET",
            `/issue/${issueKey}?fields=fixVersions`
        );

        return issue.fields.fixVersions || [];
    }

    async removeFixVersionFromIssue(versionId: string, issueKey: string): Promise<void> {
        // First, get current fix versions
        const currentVersions = await this.getFixVersionsForIssue(issueKey);

        // Filter out the version to remove
        const updatedVersions = currentVersions
            .filter(version => version.id !== versionId)
            .map(version => ({ id: version.id }));

        // Update the issue with the filtered versions
        await this.apiRequest("PUT", `/issue/${issueKey}`, {
            fields: {
                fixVersions: updatedVersions
            }
        });
    }

    private async getIssuesForVersion(versionId: string): Promise<string[]> {
        const issues = await this.apiRequest<{ issues: Array<{ key: string }> }>(
            "GET",
            `/search?jql=fixVersion=${versionId}`
        );

        return issues.issues.map(issue => issue.key);
    }

    async getIssuesWithDetailsForVersion(versionId: string): Promise<JiraIssue[]> {
        const response = await this.apiRequest<{ issues: JiraIssue[] }>(
            "GET",
            `/search?jql=fixVersion=${versionId}&fields=summary`
        );

        return response.issues;
    }

    async searchIssueByKey(issueKey: string): Promise<JiraIssue | null> {
        try {
            const issue = await this.apiRequest<JiraIssue>("GET", `/issue/${issueKey}?fields=summary`);
            return issue;
        } catch (_e) {
            // If issue not found or other error
            return null;
        }
    }
}
