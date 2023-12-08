import { ListValue } from "mendix";
import { GridState } from "../../typings/GridState";

type SortInstruction = ListValue["sortOrder"] extends Array<infer T> ? T : never;

export function getSortInstructions({ sort, columns }: GridState): SortInstruction[] {
    return sort.flatMap(([id, dir]) => {
        const column = columns.find(c => c.columnId === id);
        const inst = column?.sortInstruction(dir);
        return inst ? [inst] : [];
    });
}
