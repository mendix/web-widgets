export type InputData<T = string> = [string, T | null, T | null];

export type SelectData = string[];

export type FilterData = InputData | SelectData | null;

export type FiltersSettingsMap<T> = Map<T, FilterData>;
