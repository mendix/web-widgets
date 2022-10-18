import { join } from "path";
import { access } from "fs/promises";
import { versionSchema } from "./version";
import { z } from "zod";

export interface PackageJsonFileContent {
    name?: string;
    mxpackage?: {
        name: string;
        type: "module" | "widget" | "jsactoins";
        mpkName?: string;
        dependencies?: string[];
    };
    license: string;
    moduleFolderNameInModeler?: string;
    version?: string;
    private?: boolean;

    repository?: {
        type: "git";
        url: string;
    };

    marketplace?: {
        minimumMXVersion: string;
        appName?: string;
        appNumber?: number;
    };

    testProject?: {
        githubUrl: string;
        branchName: string;
    };

    packagePath?: string;
}

export const appNumberSchema = z.number().positive().int();
export const appNameSchema = z.string().min(1);

export const MxPackageNameSchema = z
    .string()
    .min(3)
    .regex(/^[A-Z][a-zA-Z]+$/m, "Expected MxPackageName to be writtern in CamelCase, (eg. TreeNode)");

export const MxPackageTypeSchema = z.enum(["module", "widget", "jsaction"]);

export const MxPackageSchema = z.object({
    name: MxPackageNameSchema,
    type: MxPackageTypeSchema,
    mpkName: z.string().endsWith(".mpk").optional(),
    dependencies: z.string().array().optional().default([])
});

export const MarketplaceSchema = z.object({
    minimumMXVersion: versionSchema,
    appName: appNameSchema,
    appNumber: appNumberSchema
});

export const TestProjectSchema = z.object({
    githubUrl: z.string().url(),
    branchName: z.string().min(3)
});

export const RepositorySchema = z.object({
    type: z.literal("git"),
    url: z.string().url()
});

export const PackageSchema = z.object({
    name: z.string().min(1),
    version: versionSchema,
    private: z.boolean().optional(),
    license: z.literal("Apache-2.0"),
    mxpackage: MxPackageSchema,
    marketplace: MarketplaceSchema.partial({
        appName: true,
        appNumber: true
    }),
    repository: RepositorySchema,
    testProject: TestProjectSchema
});

export const PublishedPackageSchema = PackageSchema.extend({
    marketplace: MarketplaceSchema
});

export const WidgetPackageSchema = PackageSchema.extend({
    mxpackage: MxPackageSchema.extend({
        type: z.literal("widget")
    }),
    packagePath: z.string().startsWith("com.mendix.")
});

export const ModulePackageSchema = PackageSchema.extend({
    mxpackage: MxPackageSchema.extend({
        type: z.literal("module")
    }),
    moduleFolderNameInModeler: z.string().min(3)
});

export const JSActionsPackageSchema = PackageSchema.extend({
    mxpackage: MxPackageSchema.extend({
        type: z.literal("jsactoins")
    })
});

export interface PackageInfo extends z.infer<typeof PackageSchema> {}

export interface PublishedInfo extends z.infer<typeof PublishedPackageSchema> {}

export interface WidgetInfo extends z.infer<typeof WidgetPackageSchema> {
    mpkName: string;
}

export interface ModuleInfo extends z.infer<typeof ModulePackageSchema> {
    mpkName: string;
}

export interface JSActionsInfo extends z.infer<typeof JSActionsPackageSchema> {}

export async function getPackageFileContent(dirPath: string): Promise<PackageJsonFileContent> {
    const pkgPath = join(dirPath, `package.json`);
    try {
        await access(pkgPath);
        const result = (await import(pkgPath)) as PackageJsonFileContent;
        return result;
    } catch (error) {
        console.log(error);
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        throw new Error("Error while reading package info at " + dirPath);
    }
}

export async function getPackageInfo(path: string): Promise<PackageInfo> {
    const packageJson = await getPackageFileContent(path);
    return PackageSchema.parse(packageJson);
}

export async function getPublishedInfo(path: string): Promise<PublishedInfo> {
    const packageJson = await getPackageFileContent(path);
    return PublishedPackageSchema.parse(packageJson);
}

export async function getWidgetInfo(path: string): Promise<WidgetInfo> {
    const packageJson = await getPackageFileContent(path);
    const info = WidgetPackageSchema.parse(packageJson);
    const mpkName = info.mxpackage.mpkName ?? `${info.packagePath}.${info.mxpackage.name}.mpk`;

    return {
        ...info,
        mpkName
    };
}

export async function getModuleInfo(path: string): Promise<ModuleInfo> {
    const packageJson = await getPackageFileContent(path);
    const info = ModulePackageSchema.parse(packageJson);
    const mpkName = info.mxpackage.mpkName ?? `${info.mxpackage.name}.mpk`;

    return {
        ...info,
        mpkName
    };
}

export async function getJSActionsInfo(path: string): Promise<JSActionsInfo> {
    const packageJson = await getPackageFileContent(path);
    return JSActionsPackageSchema.parse(packageJson);
}
