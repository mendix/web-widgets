import { createElement, ReactElement, useEffect } from "react";

import { AppEventsContainerProps } from "../typings/AppEventsProps";
import "./ui/AppEvents.scss";

export default function Appevents(props: AppEventsContainerProps): ReactElement {
    const { onPageLoad, onPageUnload, pageLoadDelay, pageUnloadDelay } = props;
    useEffect(() => {
        if (onPageLoad !== undefined) {
            setTimeout(onPageLoad.execute, pageLoadDelay * 1000);
        }

        return () => {
            if (onPageUnload !== undefined) {
                setTimeout(onPageUnload.execute, pageUnloadDelay * 1000);
            }
        };
    }, []);

    return <div className="widget-appevents"></div>;
}
