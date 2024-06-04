import { useRef } from "react";
import { useTransmit } from "./useTransmit";
import { $events } from "../common";

export function useOnResetFiltersEvent(inputChannel: string, broadcastChannel: string): void {
    useTransmit(
        useRef<Parameters<typeof useTransmit>[0]>({
            inputChannel,
            event: $events.reset.filters,
            onEvent: (emit, args) => {
                emit(broadcastChannel, $events.reset.value, ...args);
            }
        }).current
    );
}
