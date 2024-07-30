import { IReactionDisposer, autorun } from "mobx";
import { useState, useEffect, useRef } from "react";
import { RootGalleryStore } from "../stores/RootGalleryStore";
import { GalleryContainerProps } from "../../typings/GalleryProps";

export function useRootGalleryStore(props: GalleryContainerProps): RootGalleryStore {
    const datasourceRef = useRef(props.datasource);
    const [rootStore] = useState(() => {
        return new RootGalleryStore(props);
    });

    useEffect(() => {
        rootStore.setup();
        return () => rootStore.dispose();
    }, [rootStore]);

    useEffect(() => {
        rootStore.updateProps(props);
        datasourceRef.current = props.datasource;
    });

    useEffect(() => {
        const disposers: IReactionDisposer[] = [];

        // apply sorting
        // disposers.push(
        //     autorun(() => {
        //         datasourceRef.current.setSortOrder(rootStore.sortInstructions);
        //     })
        // );

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
