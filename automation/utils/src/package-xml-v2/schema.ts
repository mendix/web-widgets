import { z } from "zod";

const FileTag = z.object({
    "@_path": z.string()
});

const FileNode = z.union([FileTag, FileTag.array()]);

export const ModelerProjectPackageFile = z.object({
    "?xml": z.object({
        "@_version": z.literal("1.0"),
        "@_encoding": z.literal("utf-8")
    }),
    package: z.object({
        "@_xmlns": z.literal("http://www.mendix.com/package/1.0/"),
        modelerProject: z.object({
            "@_xmlns": z.literal("http://www.mendix.com/modelerProject/1.0/"),
            module: z.object({
                "@_name": z.string()
            }),
            projectFile: z.object({
                "@_path": z.string()
            }),
            files: z.union([
                z.literal(""),
                z.object({
                    file: FileNode
                })
            ])
        })
    })
});

export type ModelerProjectPackageFile = z.infer<typeof ModelerProjectPackageFile>;

export const ClientModulePackageFile = z.object({
    "?xml": z.object({
        "@_version": z.literal("1.0"),
        "@_encoding": z.literal("utf-8")
    }),
    package: z.object({
        "@_xmlns": z.literal("http://www.mendix.com/package/1.0/"),
        clientModule: z.object({
            "@_name": z.string({
                required_error: "name attribute is required"
            }),
            "@_version": z.string({
                required_error: "version attribute is required"
            }),
            "@_xmlns": z.literal("http://www.mendix.com/clientModule/1.0/"),

            files: z.union([
                z.literal(""),
                z.object({
                    file: FileNode
                })
            ]),

            widgetFiles: z.union([
                z.literal(""),
                z.object({
                    widgetFile: FileNode
                })
            ])
        })
    })
});

export type ClientModulePackageFile = z.infer<typeof ClientModulePackageFile>;
