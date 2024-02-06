import { ReactElement, createElement } from "react";
import { AppEventsPreviewProps } from "../typings/AppEventsProps";
import "./ui/AppEventsPreview.css";

export function preview({}: AppEventsPreviewProps): ReactElement {
    return <div className=".app-events-preview">App Events</div>;
}
