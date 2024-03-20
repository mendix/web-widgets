import { useRef } from "react";
import { useListenChannelEvents } from "./useListenChannelEvents";
import { Emit, requirePlugin } from "../plugin";

type Params = {
    inputChannel: string;
    event: string;
    onEvent: (emit: Emit) => void;
};

const emit: Emit = (...args) => requirePlugin().emit(...args);

export function useTransmit(params: Params): void {
    useListenChannelEvents(params.inputChannel, params.event, useRef(() => params.onEvent(emit)).current);
}
