import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { useEffect, useState } from "react";
import { RootGridStore } from "./RootGridStore";
import { autorun, IReactionDisposer } from "mobx";
import { and } from "mendix/filters/builders";

export function useRootStore(props: DatagridContainerProps) {
    const [rootStore] = useState(() => {
        return new RootGridStore(props);
    });

    useEffect(() => {
        const disposers: IReactionDisposer[] = [];
        // apply sorting
        disposers.push(
            autorun(() => {
                props.datasource.setSortOrder(rootStore.sortInstructions);
            })
        );

        // apply filters
        disposers.push(
            autorun(() => {
                const filters = rootStore.filterConditions;

                if (!filters) {
                    // filters didn't change, don't apply them
                    return;
                }

                if (filters.length > 0) {
                    props.datasource.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
                } else {
                    props.datasource.setFilter(undefined);
                }
            })
        );

        return () => {
            disposers.forEach(d => d());
            rootStore.dispose();
        };
    }, []);

    useEffect(() => {
        rootStore.updateProps(props);
    });

    return rootStore;
}
