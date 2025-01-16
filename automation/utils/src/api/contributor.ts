import assert from "node:assert/strict";
import { fetch, BodyInit } from "../fetch";
import { z } from "zod";
import { Version } from "../version";
import { fgGreen } from "../ansi-colors";

export interface CreateDraftSuccessResponse {
    App: App;
    AppVisibility: string;
    Banner: Banner;
    Category: Category;
    DemoURL: string;
    Description: string;
    Documentation: string;
    FileUploadType: string;
    FrameworkVersion: string;
    GitHub: GitHub;
    IsFirstVersion: boolean;
    IsPricingApplicable: boolean;
    License: License;
    Logo: Logo;
    MajorNumber: number;
    MinorNumber: number;
    Name: string;
    PatchNumber: number;
    ReleaseNotes: string;
    Screenshots: Screenshot[];
    SourceFileDocument: SourceFileDocument;
    Status: string;
    SubCategory: SubCategory;
    UUID: string;
}

export interface App {
    AppNumber: number;
    IndustryClouds: IndustryCloud[];
}

export interface IndustryCloud {
    Name: string;
}

export interface Banner {
    FileID: number;
    Name: string;
}

export interface Category {
    Name: string;
}

export interface GitHub {
    ArtifactURL: string;
    ReleaseTagName: string;
    ReleaseTagUrl: string;
    RepositoryURL: string;
    UseReadMeForDoc: boolean;
}

export interface License {
    Name: string;
    Url: string;
}

export interface Logo {
    FileID: number;
    Name: string;
}

export interface Screenshot {
    FileID: number;
    Name: string;
}

export interface SourceFileDocument {
    FileID: number;
    Name: string;
}

export interface SubCategory {
    Name: string;
}

async function fetchContributor<T = unknown>(method: "PATCH" | "POST", path: string, body: BodyInit): Promise<T> {
    const url = process.env.CPAPI_URL;
    const user = process.env.CPAPI_USER;
    const openId = process.env.CPAPI_USER_OPENID;
    const pass = process.env.CPAPI_PASS;

    assert.ok(url, "env.CPAPI_URL is empty");
    assert.ok(user, "env.CPAPI_USER is empty");
    assert.ok(openId, "env.CPAPI_USER_OPENID is empty");
    assert.ok(pass, "env.CPAPI_PASS is empty");

    const Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;

    return fetch<T>(method, `${url}/${path}`, body, {
        OpenID: openId,
        Authorization
    });
}

const CreateDraftParams = z.object({
    appName: z.string().min(1),
    appNumber: z.number().positive().int(),
    reactReady: z.boolean().optional().default(false),
    version: z.instanceof(Version),
    studioProVersion: z.instanceof(Version),
    artifactUrl: z.string().url()
});

type CreateDraftParams = z.infer<typeof CreateDraftParams>;

export async function createDraft(params: CreateDraftParams): Promise<CreateDraftSuccessResponse> {
    const { appName, appNumber, version, studioProVersion, artifactUrl, reactReady } = CreateDraftParams.parse(params);
    console.log(`Creating draft in the Mendix Marketplace...`);
    console.log(
        fgGreen(
            `AppName: ${appName} - AppNumber: ${appNumber} - Version: ${version.format()} - StudioPro: ${studioProVersion.format()}`
        )
    );
    const [major, minor, patch] = version.toTuple();
    try {
        const body = {
            VersionMajor: major,
            VersionMinor: minor,
            VersionPatch: patch,
            Name: appName,
            StudioProVersion: studioProVersion.format(),
            IsSourceGitHub: true,
            IsReactClientReady: reactReady,
            GithubRepo: {
                UseReadmeForDoc: false,
                ArtifactURL: artifactUrl
            }
        };

        return fetchContributor("POST", `packages/${appNumber}/versions`, JSON.stringify(body));
    } catch (error) {
        if (error instanceof Error) {
            error.message = `Failed to create draft in the appstore with error: ${error.message}`;
        }
        throw error;
    }
}

const PublishDraftParams = z.object({
    draftUUID: z.string().uuid()
});

type PublishDraftParams = z.infer<typeof PublishDraftParams>;

export async function publishDraft(params: PublishDraftParams): Promise<void> {
    const { draftUUID } = PublishDraftParams.parse(params);
    console.log(`Publishing draft in the Mendix Marketplace...`);
    try {
        const response = await fetchContributor(
            "PATCH",
            `package-versions/${draftUUID}`,
            JSON.stringify({ Status: "Publish" })
        );
        console.dir(response, { depth: 5 });
    } catch (error) {
        if (error instanceof Error) {
            error.message = `Failed publishing draft in the appstore with error: ${error.message}`;
        }
        throw error;
    }
}
