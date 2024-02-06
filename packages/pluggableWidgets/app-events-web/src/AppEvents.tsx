import { createElement, ReactElement, useEffect } from "react";

import { AppEventsContainerProps } from "../typings/AppEventsProps";
import { ActionValue } from "mendix";
import "./ui/AppEvents.scss";

const executeAction = (action: ActionValue | undefined, delay: number): void => {
    if (action !== undefined) {
        setTimeout(action.execute, delay * 1000);
    }
};

export default function Appevents(props: AppEventsContainerProps): ReactElement {
    const { onPageLoad, onPageUnload, pageLoadDelay, pageUnloadDelay } = props;

    useEffect(() => {
        executeAction(onPageLoad, pageLoadDelay);
        return () => {
            executeAction(onPageUnload, pageUnloadDelay);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className="widget-appevents"></div>;
}
