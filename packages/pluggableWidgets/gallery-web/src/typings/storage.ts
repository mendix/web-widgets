import { PlainJs } from "@mendix/filter-commons/typings/settings";

export interface ObservableStorage {
    data: PlainJs;
    setData(data: PlainJs): void;
}
