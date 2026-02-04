import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { useLoaderViewModel } from "../model/hooks/injection-hooks";

export const RefreshStatus = observer(function RefreshStatus(): ReactNode {
    const loaderVM = useLoaderViewModel();

    if (!loaderVM.showRefreshIndicator) return null;

    if (!loaderVM.isRefreshing) return null;

    return (
        <div>
            <div className="mx-refresh-container">
                <progress className="mx-refresh-indicator" />
            </div>
        </div>
    );
});
