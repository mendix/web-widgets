import { DynamicValue, ObjectItem } from "mendix";
import { useMemo } from "react";

interface MxObjectInfo {
    guid: string;
    entityName: string;
}

export function useMxObjectInfo(objectSource: DynamicValue<ObjectItem>): MxObjectInfo | undefined {
    const object = (objectSource as any)?.value as ObjectItem | undefined;

    const guid = object?.id;
    const entityName = object ? extractEntityName(object) : undefined;
    return useMemo(() => {
        if (!guid || !entityName) {
            return undefined;
        }

        return {
            guid,
            entityName
        };
    }, [guid, entityName]);
}

function extractEntityName(object: ObjectItem): string {
    const mxObj = (object as any)[Object.getOwnPropertySymbols(object)[0]];
    if (!mxObj) {
        throw new Error("Unable to extract entity name. mxObject was not found.");
    }
    return mxObj.getEntity();
}
