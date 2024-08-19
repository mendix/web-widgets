import { AllFunctions } from "./FilterFunctions";

export type InputData<Fn = AllFunctions> = [Fn, string | null, string | null];

export type SelectData = string[];

export type FilterData = InputData | SelectData | null;

export type FiltersSettingsMap<T> = Map<T, FilterData>;
