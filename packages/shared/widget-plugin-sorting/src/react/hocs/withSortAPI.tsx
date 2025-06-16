import { ErrorBoundary } from "@mendix/widget-plugin-component-kit/ErrorBoundary";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { observer } from "mobx-react-lite";
import { createElement, FC, useEffect } from "react";
import { SortAPI, useSortAPI } from "../context";

export function withSortAPI<P extends object>(Component: FC<P & { sortAPI: SortAPI }>): FC<P> {
    const SortAPIInjector = observer<P>(function SortAPIInjector(props) {
        const id = useConst(() => `SortAPIInjector@${generateUUID()}`);
        const sortAPI = useSortAPI();

        useEffect(() => sortAPI.host.useHost(id), [sortAPI.host, id]);

        if (sortAPI.host.usedBy !== null && sortAPI.host.usedBy !== id) {
            return null;
        }

        return <Component {...props} sortAPI={sortAPI} />;
    });

    return function (props): React.ReactElement {
        return (
            <ErrorBoundary>
                <SortAPIInjector {...props} />
            </ErrorBoundary>
        );
    };
}
