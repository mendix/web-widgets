import classnames from "classnames";
import { ReactElement, useMemo } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { PusherContainerProps } from "../typings/PusherProps";
import { usePusherSubscribe } from "./hooks/usePusherSubscribe";
import "./ui/Pusher.scss";
import { getChannelName } from "./utils/getChannelName";

export default function Pusher(props: PusherContainerProps): ReactElement {
    const { class: className, objectSource, eventHandlers } = props;

    const channelName = getChannelName(objectSource);

    const subscription = useMemo(() => {
        if (!channelName) {
            return undefined;
        }

        const eventBindings = eventHandlers.map(handler => ({
            eventName: handler.actionName,
            onEvent: () => {
                executeAction(handler.action);
            }
        }));

        if (eventBindings.length === 0) {
            return undefined;
        }

        return { channelName, eventBindings };
    }, [channelName, eventHandlers]);

    usePusherSubscribe(subscription);

    return <div className={classnames("widget-pusher", className)} />;
}
