#!/usr/bin/env ts-node-script

import { Jira } from "../src/jira";

/**
 * Jira version creation has historically 404'd transiently and must never
 * block a release, so this always exits 0 and reports status via stdout JSON.
 */
async function main(): Promise<void> {
    const versionName = process.argv[2];

    if (!versionName) {
        throw new Error(
            "Usage: rui-create-jira-version <version-name>\nExample: rui-create-jira-version combobox-web-v2.9.0"
        );
    }

    const apiToken = process.env.JIRA_API_TOKEN;
    if (!apiToken) {
        console.log(JSON.stringify({ status: "skipped", reason: "JIRA_API_TOKEN not set" }));
        return;
    }

    const projectKey = process.env.JIRA_PROJECT_KEY ?? "WC";
    const baseUrl = process.env.JIRA_BASE_URL ?? "https://mendix.atlassian.net";

    try {
        const jira = new Jira(projectKey, baseUrl, apiToken);
        await jira.initializeProjectData();

        const existing = jira.findVersion(versionName);
        if (existing) {
            console.log(JSON.stringify({ status: "exists", name: existing.name, id: existing.id }));
            return;
        }

        const created = await jira.createVersion(versionName);
        console.log(JSON.stringify({ status: "created", name: created.name, id: created.id }));
    } catch (error) {
        console.log(
            JSON.stringify({ status: "skipped", reason: error instanceof Error ? error.message : String(error) })
        );
    }
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
