import { RefreshIndicator } from "@mendix/widget-plugin-component-kit/RefreshIndicator";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { useLoaderViewModel } from "../model/hooks/injection-hooks";

export const RefreshStatus = observer(function RefreshStatus(): ReactNode {
    const loaderVM = useLoaderViewModel();

    if (!loaderVM.showRefreshIndicator) return null;

    return loaderVM.isRefreshing ? <RefreshIndicator /> : null;
});
