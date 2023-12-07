import { GridState } from "../../typings/GridState";

export type InitState = GridState;

export interface InitViewState {
    filter?: undefined;
    sortOrder?: unknown[];
}

export type ComputedInitState = [initState: InitState, initView: InitViewState] | [initState: InitState];
