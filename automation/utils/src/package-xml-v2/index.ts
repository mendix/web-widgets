import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { readFile, writeFile } from "fs/promises";
import { Version, VersionString } from "../version";
import { ClientModulePackageFile } from "./schema";

export function xmlTextToXmlJson(xmlText: string | Buffer): unknown {
    const parser = new XMLParser({ ignoreAttributes: false });
    return parser.parse(xmlText);
}

export function xmlJsonToXmlText(xmlObject: any): string {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        indentBy: "    ",
        suppressEmptyNode: true
    });
    return builder
        .build(xmlObject)
        .replaceAll(/(<[^>]*?)\/>/g, "$1 />") // Add space before /> in self-closing tags
        .replaceAll(/(<\?[^>]*?)\?>/g, "$1 ?>"); // Add space before ?> in XML declarations
}

export interface ClientPackageXML {
    name: string;
    version: Version;
    widgetFiles: string[];
    files: string[];
}

export async function readClientPackageXml(path: string): Promise<ClientPackageXML> {
    return parseClientPackageXml(ClientModulePackageFile.passthrough().parse(xmlTextToXmlJson(await readFile(path))));
}

export async function writeClientPackageXml(path: string, data: ClientPackageXML): Promise<void> {
    await writeFile(path, xmlJsonToXmlText(buildClientPackageXml(data)));
}

function parseClientPackageXml(xmlJson: ClientModulePackageFile): ClientPackageXML {
    const clientModule = xmlJson?.package?.clientModule ?? {};
    const widgetFilesNode = clientModule.widgetFiles !== "" ? clientModule.widgetFiles?.widgetFile : undefined;
    const filesNode = clientModule.files !== "" ? clientModule.files?.file : undefined;

    const extractPaths = (node: any): string[] => {
        if (!node) return [];
        if (Array.isArray(node)) {
            return node.map((item: any) => item["@_path"]);
        }
        return [node["@_path"]];
    };

    const name = clientModule["@_name"] ?? "";
    const versionString = clientModule["@_version"] ?? "1.0.0";

    return {
        name,
        version: Version.fromString(versionString as VersionString),
        widgetFiles: extractPaths(widgetFilesNode),
        files: extractPaths(filesNode)
    };
}

function buildClientPackageXml(clientPackage: ClientPackageXML): ClientModulePackageFile {
    const toXmlNode = <T extends "file" | "widgetFile">(arr: string[], tag: T) => {
        if (arr.length === 0) return "";
        if (arr.length === 1) {
            return { [tag]: { "@_path": arr[0] } };
        }
        return { [tag]: arr.map(path => ({ "@_path": path })) };
    };

    return {
        "?xml": {
            "@_version": "1.0",
            "@_encoding": "utf-8"
        },
        package: {
            clientModule: {
                widgetFiles: toXmlNode(
                    clientPackage.widgetFiles,
                    "widgetFile"
                ) as ClientModulePackageFile["package"]["clientModule"]["widgetFiles"],
                files: toXmlNode(
                    clientPackage.files,
                    "file"
                ) as ClientModulePackageFile["package"]["clientModule"]["files"],
                "@_name": clientPackage.name,
                "@_version": clientPackage.version.format(),
                "@_xmlns": "http://www.mendix.com/clientModule/1.0/"
            },
            "@_xmlns": "http://www.mendix.com/package/1.0/"
        }
    };
}
