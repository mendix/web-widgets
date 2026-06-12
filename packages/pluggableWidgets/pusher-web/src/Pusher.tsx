import classnames from "classnames";
import { ReactElement, useCallback, useMemo } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { PusherContainerProps } from "../typings/PusherProps";
import { usePusherSubscribe } from "./hooks/usePusherSubscribe";
import "./ui/Pusher.scss";
import { getChannelName } from "./utils/getChannelName";

export default function Pusher(props: PusherContainerProps): ReactElement {
    const { class: className, objectSource, eventHandlers } = props;

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

        // Build event bindings from configured handlers
        const eventBindings = eventHandlers
            .filter(handler => handler.actionName && handler.action?.canExecute)
            .map(handler => ({
                eventName: handler.actionName,
                onEvent: () => {
                    console.debug(`[Pusher] Event received: ${handler.actionName}`);
                    executeAction(handler.action);
                }
            }));

        // If no valid handlers, return undefined (no subscription)
        if (eventBindings.length === 0) {
            return undefined;
        }

        return {
            channelName,
            eventBindings,
            onError: handleError
        };
    }, [channelName, eventHandlers, handleError]);

    usePusherSubscribe(subscription);

    return <div className={classnames("widget-pusher", className)} />;
}
