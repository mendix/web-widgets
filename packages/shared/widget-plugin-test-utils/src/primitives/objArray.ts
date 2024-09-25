import { ObjectItem } from "mendix";
import { obj } from "./obj.js";

export function objArray(length = 1): ObjectItem[] {
    length = Math.floor(length);
    return length > 0 ? Array.from({ length }, obj) : [];
}

/** @deprecated Renamed to {@link objArray} */
export const objectItems = objArray;
