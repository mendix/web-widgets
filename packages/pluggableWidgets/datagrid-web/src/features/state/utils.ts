import { ListValue } from "mendix";
import { GridState } from "../../typings/GridState";

type SortInstruction = ListValue["sortOrder"] extends Array<infer T> ? T : never;

export function getSortInstructions({ sort, columns }: GridState): SortInstruction[] {
    return sort.flatMap(([id, dir]) => {
        const inst = columns[id].sortInstruction(dir);
        return inst ? [inst] : [];
    });
}
