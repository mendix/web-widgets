import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { useEffect, useRef, useState } from "react";
import { RootGridStore } from "./RootGridStore";
import { autorun, IReactionDisposer } from "mobx";
import { and } from "mendix/filters/builders";

export function useRootStore(props: DatagridContainerProps): RootGridStore {
    const [rootStore] = useState(() => {
        return new RootGridStore(props);
    });

    const datasourceRef = useRef(props.datasource);
    datasourceRef.current = props.datasource;

    useEffect(() => {
        const disposers: IReactionDisposer[] = [];
        // apply sorting
        disposers.push(
            autorun(() => {
                datasourceRef.current.setSortOrder(rootStore.sortInstructions);
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
                    datasourceRef.current.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
                } else {
                    datasourceRef.current.setFilter(undefined);
                }
            })
        );

        return () => {
            disposers.forEach(d => d());
            rootStore.dispose();
        };
    }, [rootStore]);

    useEffect(() => {
        rootStore.updateProps(props);
    });

    return rootStore;
}
