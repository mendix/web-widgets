import { ListAttributeValue } from "mendix";
import { nanoid } from "./nanoid";

export function attrId(id = nanoid()): ListAttributeValue["id"] {
    return `attr_${id}` as ListAttributeValue["id"];
}
