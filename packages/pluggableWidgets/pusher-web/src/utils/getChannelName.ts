import { DynamicValue, ObjectItem } from "mendix";

export function getChannelName(objectSource: DynamicValue<ObjectItem>): string | undefined {
    const object = objectSource.value;

    if (!object) {
        return undefined;
    }

    const guid = object.id;
    const entityName = extractEntityName(object);

    if (!guid || !entityName) {
        return undefined;
    }

    return buildChannelName(entityName, guid);
}

function extractEntityName(object: ObjectItem): string {
    const mxObj = (object as any)[Object.getOwnPropertySymbols(object)[0]];
    if (!mxObj) {
        throw new Error("Unable to extract entity name. mxObject was not found.");
    }
    return mxObj.getEntity();
}

function buildChannelName(entityName: string, guid: string): string {
    return `private-${entityName}.${guid}`;
}
