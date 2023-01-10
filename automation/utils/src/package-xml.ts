import { z } from "zod";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { readFile, writeFile } from "fs/promises";
import path from "node:path";

const EmptyTagWithoutAttributes = z.literal("");

const FileTag = z.object({
    "@_path": z.string()
});

type FileTag = z.infer<typeof FileTag>;

const FileTagArray = FileTag.array();

type FileTagArray = z.infer<typeof FileTagArray>;

const FileNode = z.union([EmptyTagWithoutAttributes, FileTag, FileTagArray]);

type FileNode = z.infer<typeof FileNode>;

const FilesTag = z.object({
    file: FileNode
});

const Content = z.object({
    files: z.union([EmptyTagWithoutAttributes, FilesTag])
});

type Content = z.infer<typeof Content>;

const ModelerProjectPackageFile = z.object({
    package: z.object({
        modelerProject: Content
    })
});

type ModelerProjectPackageFile = z.infer<typeof ModelerProjectPackageFile>;

const ClientModuleContent = Content.extend({
    "@_name": z.string({
        required_error: "name attribute is required"
    }),
    "@_version": z.string({
        required_error: "version attribute is required"
    }),
    "@_xmlns": z.literal("http://www.mendix.com/clientModule/1.0/")
});

type ClientModuleContent = z.infer<typeof ClientModuleContent>;

export const ClientModulePackageFile = z.object({
    package: z.object({
        clientModule: ClientModuleContent
    })
});

export type ClientModulePackageFile = z.infer<typeof ClientModulePackageFile>;

type DataParser = (data: unknown) => Content;

export type PackageType = "clientModule" | "modelerProject";

export const dataParsers: Record<PackageType, DataParser> = {
    modelerProject: data => ModelerProjectPackageFile.passthrough().parse(data).package.modelerProject,
    clientModule: data => ClientModulePackageFile.passthrough().parse(data).package.clientModule
};

function addFileNodes(node: FileNode, items: FileTagArray): FileNode {
    if (items.length === 0) {
        return node;
    }

    // return items if files empty
    if (node === "") {
        return [...items];
    }

    if (Array.isArray(node)) {
        return [...node, ...items];
    }

    // at this point we know that files is single object
    return [node, ...items];
}

function concatFiles(tag: Content, files: FileTagArray): Content {
    if (files.length === 0) {
        return tag;
    }

    // If tag is empty (<files></files>) files = ""
    const current = tag.files === "" ? [] : tag.files.file;

    return {
        files: {
            file: addFileNodes(current, files)
        }
    };
}

function mergeContent(packageType: PackageType, xml: any, content: Content): unknown {
    return {
        ...xml,
        package: {
            ...xml.package,
            [packageType]: {
                ...xml.package[packageType],
                ...content
            }
        }
    };
}

export async function readXml(filePath: string): Promise<unknown> {
    const parser = new XMLParser({ ignoreAttributes: false });
    return parser.parse(await readFile(filePath));
}

export async function writeXml(filePath: string, xml: any): Promise<void> {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        indentBy: "    ",
        suppressEmptyNode: true
    });
    await writeFile(filePath, builder.build(xml));
}

/**
 * @pararm filePath - package.xml path
 * @param paths - relative package paths
 */
export async function addFilesToPackageXml(filePath: string, paths: string[], packageType: PackageType): Promise<void> {
    const files = paths.map(path => ({ "@_path": path }));
    const xml = await readXml(filePath);
    const content = dataParsers[packageType](xml);
    const updatedXml = mergeContent(packageType, xml, concatFiles(content, files));
    await writeXml(filePath, updatedXml);
}

export async function readPackageXml(cwd: string): Promise<unknown> {
    return readXml(path.join(cwd, "src", "package.xml"));
}
