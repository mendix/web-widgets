import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { useEffect, useRef, useState } from "react";
import { RootGridStore } from "./RootGridStore";
import { autorun, IReactionDisposer } from "mobx";

export function useRootStore(props: DatagridContainerProps): RootGridStore {
    const [rootStore] = useState(() => {
        return new RootGridStore(props);
    });

    useEffect(() => {
        const cleanup = rootStore.setup();
        return () => {
            rootStore.dispose();
            cleanup?.();
        };
    }, [rootStore]);

    useEffect(() => {
        rootStore.updateProps(props);
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
                datasourceRef.current.setFilter(rootStore.conditions);
            })
        );

        return () => {
            disposers.forEach(d => d());
        };
    }, [rootStore]);

    return rootStore;
}
