import { Json } from "@mendix/filter-commons/typings/settings";

export interface ObservableJsonStorage {
    data: Json;
    setData(data: Json): void;
}
