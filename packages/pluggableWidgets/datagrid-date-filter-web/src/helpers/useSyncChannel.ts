import { useState, useRef, useEffect } from "react";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { APIDeps, SyncChannel } from "./SyncChannel";

export function useSyncChannel(props: DatagridDateFilterContainerProps): SyncChannel {
    const deps: APIDeps = {
        valueAttribute: props.valueAttribute,
        startDateAttribute: props.startDateAttribute,
        endDateAttribute: props.endDateAttribute,
        onChange: props.onChange
    };

    const depsBox = useRef(deps);
    const [sc] = useState(() => new SyncChannel(depsBox));

    useEffect(() => {
        depsBox.current = deps;
    });

    return sc;
}
