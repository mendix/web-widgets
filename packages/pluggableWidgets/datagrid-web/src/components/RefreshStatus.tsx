import { RefreshIndicator } from "@mendix/widget-plugin-component-kit/RefreshIndicator";
import { ReactNode } from "react";
import { useLoaderViewModel } from "../model/hooks/injection-hooks";

export const RefreshStatus = function RefreshStatus(): ReactNode {
    const loaderVM = useLoaderViewModel();

    if (!loaderVM.showRefreshIndicator) return null;

    return loaderVM.isRefreshing ? <RefreshIndicator /> : null;
};
