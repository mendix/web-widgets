import { FilterCondition } from "mendix/filters";
import { FnName } from "./type-utils";

export type FilterFunction = FnName<FilterCondition>;
