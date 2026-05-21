import classnames from "classnames";
import { ReactElement, useCallback, useMemo } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { PusherContainerProps } from "../typings/PusherProps";
import { usePusherListener } from "./hooks/usePusherListener";
import "./ui/Pusher.scss";
import { useMxObjectInfo } from "./utils/useMxObjectInfo";

export default function Pusher(props: PusherContainerProps): ReactElement {
    const { class: className, objectSource, notifyChannelName, notifyAction } = props;

    // Extract object GUID and entity name from data source
    const mxObjectInfo = useMxObjectInfo(objectSource as any); // TODO: fix typings when PWT updated.

    // Event callback - triggered when Pusher event is received
    const handleEvent = useCallback(
        (data: unknown) => {
            console.debug("[Pusher] Event received:", data);

            // Execute configured action
            executeAction(notifyAction);
        },
        [notifyAction]
    );

    // Error callback
    const handleError = useCallback((error: Error) => {
        console.error("[Pusher] Subscription error:", error.message);
    }, []);

    // Setup stable subscription config
    const subscription = useMemo(() => {
        if (!mxObjectInfo) {
            return undefined;
        }

        return {
            entityName: mxObjectInfo.entityName,
            guid: mxObjectInfo.guid,
            eventName: notifyChannelName,
            onEvent: handleEvent,
            onError: handleError
        };
    }, [mxObjectInfo, handleEvent, handleError, notifyChannelName]);

    // Initialize Pusher listener
    usePusherListener(subscription);

    return <div className={classnames("widget-pusher", className)} />;
}
