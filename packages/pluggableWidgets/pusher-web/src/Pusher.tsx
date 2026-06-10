import classnames from "classnames";
import { ReactElement, useCallback, useMemo } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { PusherContainerProps } from "../typings/PusherProps";
import { usePusherSubscribe } from "./hooks/usePusherSubscribe";
import "./ui/Pusher.scss";
import { getChannelName } from "./utils/getChannelName";

export default function Pusher(props: PusherContainerProps): ReactElement {
    const { class: className, objectSource, notifyActionName, notifyEventAction } = props;

    // Event callback - triggered when Pusher event is received
    const handleEvent = useCallback(
        (data: unknown) => {
            console.debug("[Pusher] Event received:", data);

            // Execute configured action
            executeAction(notifyEventAction);
        },
        [notifyEventAction]
    );

    // Error callback
    const handleError = useCallback((error: Error) => {
        console.error("[Pusher] Subscription error:", error.message);
    }, []);

    // Build channel name based on the object
    const channelName = getChannelName(objectSource);

    // Setup stable subscription config
    const subscription = useMemo(() => {
        if (!channelName) {
            return undefined;
        }

        return {
            channelName,
            eventName: notifyActionName,
            onEvent: handleEvent,
            onError: handleError
        };
    }, [channelName, notifyActionName, handleEvent, handleError]);

    usePusherSubscribe(subscription);

    return <div className={classnames("widget-pusher", className)} />;
}
