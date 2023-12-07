export type InitState = unknown;

export interface InitViewState {
    filter?: undefined;
    sortOrder?: unknown[];
}

export type ComputedInitState = [initState: InitState, initView: InitViewState] | [initState: InitState];
