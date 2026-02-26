import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { ErrorBoundary } from "@mendix/widget-plugin-component-kit/ErrorBoundary";
import { observer } from "mobx-react-lite";
import { createElement, FC, ReactElement } from "react";
import { SortAPI, useLockSortAPI, useSortAPI } from "../context";

export function withSortAPI<P extends object>(
    Component: FC<P & { sortAPI: SortAPI }>
): FC<P & { isPreview?: boolean }> {
    const SortAPIGuard = observer(function SortAPIGuard(props: P & { sortAPI: SortAPI }): ReactElement {
        const sortAPI = useLockSortAPI(props.sortAPI);

        if (sortAPI.hasError) {
            return <Alert bootstrapStyle="danger">{sortAPI.error.message}</Alert>;
        }

        return <Component {...props} sortAPI={sortAPI.value} />;
    });

    function SortAPIInjector(props: P & { isPreview?: boolean }): ReactElement {
        const sortAPI = useSortAPI({ isPreview: props.isPreview ?? false });

        if (sortAPI.hasError) {
            return <Alert bootstrapStyle="danger">{sortAPI.error.message}</Alert>;
        }

        return <SortAPIGuard {...props} sortAPI={sortAPI.value} />;
    }

    return function (props): ReactElement {
        return (
            <ErrorBoundary>
                <SortAPIInjector {...props} />
            </ErrorBoundary>
        );
    };
}
