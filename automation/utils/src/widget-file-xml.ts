import { readPackageXml } from "./package-xml";
export interface Result {
    [key: string]: string;
}

export async function getWidgetXMLName(cwd: string): Promise<string | undefined> {
    try {
        const packageXml = (await readPackageXml(cwd)) as {
            package?: {
                clientModule?: {
                    widgetFiles: any;
                };
            };
        };
        return packageXml?.package?.clientModule?.widgetFiles.widgetFile["@_path"];
    } catch {
        return undefined;
    }
}

// Function to recursively find all captions and descriptions
export function findCaptionsAndDescriptions(obj: any, result: Result = {}): Result {
    for (const key in obj) {
        if (typeof obj[key] === "object") {
            findCaptionsAndDescriptions(obj[key], result);
        } else if (obj[key].trim() !== "") {
            if (
                key.includes("@_caption") ||
                key.toLowerCase().includes("caption") ||
                key.toLowerCase().includes("description")
            ) {
                if (!result[obj[key]]) {
                    result[obj[key]] = obj[key];
                }
            }
        }
    }
    return result;
}
