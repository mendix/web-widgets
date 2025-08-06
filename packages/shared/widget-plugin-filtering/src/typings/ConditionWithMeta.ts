import { FilterCondition } from "mendix/filters";

export type ConditionWithMeta = {
    cond: FilterCondition | undefined;
    meta: string;
};
