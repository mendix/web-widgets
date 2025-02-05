import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { readFile, writeFile } from "fs/promises";

const DEFAULT_FILE_NANOFLOW = "FileUploader.ACT_CreateUploadedFileDocument";
const DEFAULT_IMAGE_NANOFLOW = "FileUploader.ACT_CreateUploadedImageDocument";

const command = process.argv[2];

if (command !== "add" && command !== "remove") {
    console.error(`Unknown command ${command}. Allowed commands: add, remove`);
    process.exit(1);
}

const xml = await readXml("./src/FileUploader.xml");

const generalGroup = findGroupByName("General", xml.widget.properties.propertyGroup);
if (!generalGroup) {
    console.error("'General' property group is not found!");
    process.exit(1);
}

const fileNanoflow = findPropBykey("createFileAction", generalGroup.property);
const imageNanoflow = findPropBykey("createImageAction", generalGroup.property);
if (!fileNanoflow || !imageNanoflow) {
    console.error("'createFileAction' or 'createImageAction' property is not found!");
    process.exit(1);
}

if (command === "add") {
    setDefaultValue(fileNanoflow, DEFAULT_FILE_NANOFLOW);
    setDefaultValue(imageNanoflow, DEFAULT_IMAGE_NANOFLOW);
} else {
    unsetDefaultValue(fileNanoflow);
    unsetDefaultValue(imageNanoflow);
}

await writeXml("./src/FileUploader.xml", xml);

process.exit(0);

// helpers
export async function readXml(filePath) {
    const parser = new XMLParser({ ignoreAttributes: false, allowBooleanAttributes: true });
    return parser.parse(await readFile(filePath));
}

export async function writeXml(filePath, xml) {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        suppressBooleanAttributes: false,
        format: true,
        indentBy: "    ",
        suppressEmptyNode: true
        // processEntities: false,
    });
    await writeFile(filePath, builder.build(xml));
}

function findGroupByName(name, properties) {
    return properties.find(property => property["@_caption"] === name);
}

function findPropBykey(key, properties) {
    return properties.find(property => property["@_key"] === key);
}

function unsetDefaultValue(prop) {
    delete prop["@_defaultValue"];
}

function setDefaultValue(prop, defaultValue) {
    prop["@_defaultValue"] = defaultValue;
}
