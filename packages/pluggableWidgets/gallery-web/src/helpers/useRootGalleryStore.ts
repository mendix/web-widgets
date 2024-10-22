import { IReactionDisposer, reaction } from "mobx";
import { useState, useEffect, useRef } from "react";
import { RootGalleryStore } from "../stores/RootGalleryStore";
import { GalleryContainerProps } from "../../typings/GalleryProps";

export function useRootGalleryStore(props: GalleryContainerProps): RootGalleryStore {
    const datasourceRef = useRef(props.datasource);
    const [rootStore] = useState(() => {
        return new RootGalleryStore(props);
    });

    useEffect(() => rootStore.setup(), [rootStore]);

    useEffect(() => {
        rootStore.updateProps(props);
        datasourceRef.current = props.datasource;
    });

    useEffect(() => {
        const disposers: IReactionDisposer[] = [];

        // apply sorting
        disposers.push(
            reaction(
                () => rootStore.sortOrder,
                order => {
                    datasourceRef.current.setSortOrder(order);
                }
            )
        );

        // apply filters
        disposers.push(
            reaction(
                () => rootStore.conditions,
                filter => {
                    datasourceRef.current.setFilter(filter);
                },
                { fireImmediately: true }
            )
        );

        return () => {
            disposers.forEach(d => d());
        };
    }, [rootStore]);

    return rootStore;
}
