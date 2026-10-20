import { FC } from "react";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { FilterAPI, useFilterAPI } from "../context";
import { useDynamicMode } from "../dynamic/context";
import { EDYNAMICMODE } from "../errors";

export function withFilterAPI<P>(Component: FC<P & { filterAPI: FilterAPI }>): FC<P> {
    return function FilterAPIProvider(props) {
        const dynamicMode = useDynamicMode();
        const filterAPI = useFilterAPI();

        if (dynamicMode) {
            return <Alert bootstrapStyle="danger">{EDYNAMICMODE.message}</Alert>;
        }
        if (filterAPI.hasError) {
            return <Alert bootstrapStyle="danger">{filterAPI.error.message}</Alert>;
        }
        return <Component {...props} filterAPI={filterAPI.value} />;
    };
}
