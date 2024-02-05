import { createElement, ReactElement } from "react";

import { AppEventsContainerProps } from "../typings/AppEventsProps";
import "./ui/AppEvents.scss";
export default function Appevents({}: AppEventsContainerProps): ReactElement {
    return <div className="widget-appevents"></div>;
}
