export interface OptionWithState {
    caption: string;
    value: string;
    selected: boolean;
}

export interface BaseSelectStore {
    options: OptionWithState[];
}
