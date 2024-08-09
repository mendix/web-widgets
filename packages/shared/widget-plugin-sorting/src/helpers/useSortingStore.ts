import { useSortAPI } from "../context";
import { SortingStoreInterface } from "../typings";
import { Result, value, error } from "../result-meta";
import { APIError } from "../errors";

export function useSortingStore(): Result<SortingStoreInterface, APIError> {
    const api = useSortAPI();
    if (api.hasError) {
        return error(api.error);
    }

    const store = api.value.store;
    if (store.hasError) {
        return error(store.error);
    }

    return value(store.value);
}
