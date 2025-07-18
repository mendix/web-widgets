import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Context, createContext, useContext, useEffect } from "react";
import { SortStoreHost } from "../stores/SortStoreHost";
import { Result, error, value } from "./result-meta";

export interface SortAPI {
    version: 1;
    host: SortStoreHost;
}

const SORT_PATH = "com.mendix.widgets.web.sortable.sortContext";

export function getGlobalSortContext(): Context<SortAPI | null> {
    const scope = window.top === window ? window : window.top;
    return ((scope as any)[SORT_PATH] ??= createContext<SortAPI | null>(null));
}

export function useSortAPI(): Result<SortAPI, Error> {
    const api = useContext(getGlobalSortContext());
    if (api === null) {
        return error(new Error("Error: widget is out of context. Please place the widget inside the Gallery header."));
    }
    return value(api);
}

export function useLockSortAPI(api: SortAPI): Result<SortAPI, Error> {
    const id = useLock(api);

    if (api.host.usedBy !== id) {
        return error(
            new Error(
                `Error: Sort API is already in use by another widget. Remove other sort widgets and refresh the page.`
            )
        );
    }

    return value(api);
}

function useLock({ host }: SortAPI): string {
    const [unlock, id] = useConst(() => {
        const id = `useLock@${generateUUID()}`;
        return [host.lock(id), id] as const;
    });

    useEffect(() => unlock, [unlock]);

    return id;
}
