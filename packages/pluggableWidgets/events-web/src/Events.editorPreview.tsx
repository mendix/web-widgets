import { ReactElement, createElement } from "react";
import { EventsIcon } from "./assets/icons";
import "./ui/EventsPreview.css";
import { EventsPreviewProps } from "typings/EventsProps";
import classNames from "classnames";

export function preview(props: EventsPreviewProps): ReactElement {
    const eventsCount = Number(!!props.onComponentLoad) + Number(!!props.onEventChange);

    return (
        <div className={classNames("widget-events-preview", { active: eventsCount > 0 })}>
            <EventsIcon isActive={eventsCount > 0} />
            {eventsCount <= 0 ? "[Configure events]" : `[${eventsCount}] Events`}
        </div>
    );
}
