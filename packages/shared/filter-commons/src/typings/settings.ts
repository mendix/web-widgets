import { AllFunctions } from "./FilterFunctions";

export type InputData<Fn = AllFunctions> = [Fn, string | null, string | null];

export type SelectData = string[];

export type FilterData = InputData | SelectData | null | undefined;

export type FiltersSettingsMap<T> = Map<T, FilterData>;

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface Serializable {
    toJSON(): Json;
    fromJSON(data: Json): void;
}
