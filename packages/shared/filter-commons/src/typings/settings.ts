import { AllFunctions } from "./FilterFunctions";

export type InputData<Fn = AllFunctions> = [Fn, string | null, string | null];

export type SelectData = string[];

export type FilterData = InputData | SelectData | null | undefined;

export type FiltersSettingsMap<T> = Map<T, FilterData>;

export type PlainJs = string | number | boolean | null | PlainJs[] | { [key: string]: PlainJs };

export interface Serializable {
    toJSON(): PlainJs;
    fromJSON(data: PlainJs): void;
}
