import { z } from "zod";
import { xmlTextToXmlJson } from "./index";
import { readFile } from "node:fs/promises";

export const PropertiesXMLFile = z.object({
    "?xml": z.object({
        "@_version": z.literal("1.0"),
        "@_encoding": z.literal("utf-8")
    }),
    widget: z.object({
        "@_id": z.string(),
        "@_xmlns": z.literal("http://www.mendix.com/widget/1.0/"),
        "@_xmlns:xsi": z.literal("http://www.w3.org/2001/XMLSchema-instance")
    })
});

type PropertiesXMLFile = z.infer<typeof PropertiesXMLFile>;

export async function readPropertiesFile(filePath: string): Promise<PropertiesXMLFile> {
    return PropertiesXMLFile.passthrough().parse(xmlTextToXmlJson(await readFile(filePath, "utf-8")));
}
