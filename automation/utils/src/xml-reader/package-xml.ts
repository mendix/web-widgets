import { ClientModulePackageFile } from "./schema";
import { Version, VersionString } from "../version";
import { readFile, writeFile } from "fs/promises";
import { xmlJsonToXmlText, xmlTextToXmlJson } from "./parser";

export interface ClientPackageInfo {
    name: string;
    version: Version;
    widgetFiles: string[];
    files: string[];
}

function parseClientPackageXml(xmlJson: ClientModulePackageFile): ClientPackageInfo {
    const clientModule = xmlJson?.package?.clientModule ?? {};

    const name = clientModule["@_name"] ?? "";
    const versionString = clientModule["@_version"] ?? "1.0.0";

    return {
        name,
        version: Version.fromString(versionString as VersionString),
        widgetFiles: clientModule.widgetFiles !== "" ? clientModule.widgetFiles?.widgetFile.map(i => i["@_path"]) : [],
        files: clientModule.files !== "" ? clientModule.files?.file.map(i => i["@_path"]) : []
    };
}

function buildClientPackageXml(clientPackage: ClientPackageInfo): ClientModulePackageFile {
    const toXmlArray = (paths: string[]): any => {
        return paths.map(path => ({ "@_path": path }));
    };
    return {
        "?xml": {
            "@_version": "1.0",
            "@_encoding": "utf-8"
        },
        package: {
            clientModule: {
                widgetFiles:
                    clientPackage.widgetFiles.length !== 0 ? { widgetFile: toXmlArray(clientPackage.widgetFiles) } : "",
                files: clientPackage.files.length !== 0 ? { file: toXmlArray(clientPackage.files) } : "",
                "@_name": clientPackage.name,
                "@_version": clientPackage.version.format(),
                "@_xmlns": "http://www.mendix.com/clientModule/1.0/"
            },
            "@_xmlns": "http://www.mendix.com/package/1.0/"
        }
    };
}

export async function readClientPackage(path: string): Promise<ClientPackageInfo> {
    return parseClientPackageXml(ClientModulePackageFile.passthrough().parse(xmlTextToXmlJson(await readFile(path))));
}

export async function writeClientPackage(path: string, data: ClientPackageInfo): Promise<void> {
    await writeFile(path, xmlJsonToXmlText(buildClientPackageXml(data)));
}
