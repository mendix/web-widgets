import { ReactElement, createElement } from "react";
import { EventsIcon } from "./assets/icons";
import "./ui/EventsPreview.css";
import { EventsPreviewProps } from "typings/EventsProps";
import { getEventsCount, getCaption } from "./Events.editorConfig";
import classNames from "classnames";

export function preview(props: EventsPreviewProps): ReactElement {
    const eventsCount = getEventsCount(props);

    return (
        <div className={classNames("widget-events-preview", { active: eventsCount > 0 })}>
            <EventsIcon isActive={eventsCount > 0} />
            {getCaption(eventsCount)}
        </div>
    );
}
