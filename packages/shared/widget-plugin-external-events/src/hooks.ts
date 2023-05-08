import { useEffect, useState } from "react";
import { PluginExternalEvents, requirePlugin } from "./plugin";

type Emit = PluginExternalEvents["emit"];
type Subscribe = PluginExternalEvents["subscribe"];

export function useEmit(): Emit {
    const [emit] = useState(() => {
        const events = requirePlugin();
        return (...args: Parameters<Emit>) => events.emit(...args);
    });
    return emit;
}

export function useSubscribe(...args: Parameters<Subscribe>): void {
    useEffect(() => {
        const events = requirePlugin();
        return events.subscribe(...args);
    }, [args]);
}
