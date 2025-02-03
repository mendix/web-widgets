import { PropsGateController } from "@mendix/widget-plugin-mobx-kit/PropsGateController";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { autorun, IReactionDisposer } from "mobx";
import { useEffect, useRef } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { RootGridStore } from "./RootGridStore";

export function useRootStore(props: DatagridContainerProps): RootGridStore {
    const pref = useRef(props);
    const gateCtrl = useConst(() => new PropsGateController(props));
    const rootStore = useSetup(() => new RootGridStore(gateCtrl.gate));

    useEffect(() => {
        compareObjects(pref.current, props);
        console.log("same ref?", pref.current === props);
        gateCtrl.setProps(props);
        pref.current = props;
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
export function compareObjects(obj1: Record<string, any>, obj2: Record<string, any>): void {
    const differences: Record<string, { obj1: any; obj2: any }> = {};

    function compare(obj1: Record<string, any>, obj2: Record<string, any>, path: string = ""): void {
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

        allKeys.forEach(key => {
            const fullPath = path ? `${path}.${key}` : key;
            if (
                typeof obj1[key] === "object" &&
                typeof obj2[key] === "object" &&
                obj1[key] !== null &&
                obj2[key] !== null
            ) {
                compare(obj1[key], obj2[key], fullPath);
            } else if (obj1[key] !== obj2[key]) {
                differences[fullPath] = { obj1: obj1[key], obj2: obj2[key] };
            }
        });
    }

    compare(obj1, obj2);

    if (Object.keys(differences).length > 0) {
        console.log("Differences found:");
        console.table(differences);
    } else {
        console.log("No differences found.");
    }
}
