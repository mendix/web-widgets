import { ObjectItem } from "mendix";
import { nanoid } from "./nanoid";

export function obj(id = nanoid()): ObjectItem {
    id = `obj_${id}`;
    return { id } as ObjectItem;
}
