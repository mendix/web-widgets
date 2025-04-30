import { FilterCondition } from "mendix/filters";

export type FilterName = FilterCondition extends { name: infer Name } ? Name : never;
