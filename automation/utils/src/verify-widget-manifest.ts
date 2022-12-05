import { ClientModulePackageFile, readPackageXml } from "./package-xml";
import { WidgetPackageSchema, WidgetPackage } from "./package-info";

type ParsedManifests = [WidgetPackage, ClientModulePackageFile];

export async function parseManifests(jsonManifest: unknown, xmlManifest: unknown): Promise<ParsedManifests> {
    return Promise.all([
        WidgetPackageSchema.parseAsync(jsonManifest),
        ClientModulePackageFile.passthrough().parseAsync(xmlManifest)
    ]);
}

export function checkVersionsSynced(json: WidgetPackage, xml: ClientModulePackageFile): void {
    if (json.version.format() !== xml.package.clientModule["@_version"]) {
        throw new Error(`[${json.name}] package.json and package.xml versions do not match.`);
    }
}

export async function verify(cwd: string, packageJson: unknown): Promise<void> {
    const packageXml = await readPackageXml(cwd);
    const [json, xml] = await parseManifests(packageJson, packageXml);
    checkVersionsSynced(json, xml);
}
