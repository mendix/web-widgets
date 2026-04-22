import { FC } from "react";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { FilterAPI, useFilterAPI } from "../context";

export function withFilterAPI<P>(Component: FC<P & { filterAPI: FilterAPI }>): FC<P> {
    return function FilterAPIProvider(props) {
        const filterAPI = useFilterAPI();

        if (filterAPI.hasError) {
            return <Alert bootstrapStyle="danger">{filterAPI.error.message}</Alert>;
        }
        return <Component {...props} filterAPI={filterAPI.value} />;
    };
}
