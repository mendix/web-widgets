import { ObjectItem } from "mendix";
import { nanoid } from "./nanoid.js";

export function obj(id = nanoid()): ObjectItem {
    id = `obj_${id}`;
    return { id } as ObjectItem;
}
