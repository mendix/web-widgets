import { UngroupedEventsPositionEnum } from "../../typings/TimelineProps";
import { Children, createElement, ReactElement, ReactNode } from "react";
import classNames from "classnames";
import { BasicItemType, CustomItemType, ItemType, ComponentProps } from "../helpers/types";
import { Icon } from "mendix/components/web/Icon";

export default function TimelineComponent(props: ComponentProps): ReactElement {
    return (
        <div className={classNames("widget-timeline-wrapper", props.class)}>
            {getItems(props.data, props.customVisualization, props.groupEvents, props.ungroupedEventsPosition)}
        </div>
    );
}

export function getItems(
    structuredEvents: Map<string, ItemType[]>,
    customVisualization: boolean,
    groupEvents: boolean,
    orphanEventsPlacement: UngroupedEventsPositionEnum
): ReactNode[] {
    const days: ReactNode[] = [];
    const orphanDays: ReactNode[] = [];
    structuredEvents.forEach((eventsOfDay: ItemType[], groupKey: string) => {
        let events;
        let groupHeader: ReactNode = <span>{groupKey}</span>;

        if (!customVisualization) {
            events = getBasicEventsFromDay(eventsOfDay as BasicItemType[]);
        } else {
            events = getCustomEventsFromDay(eventsOfDay as CustomItemType[]);
            const firstEvent = eventsOfDay[0] as CustomItemType;
            if (firstEvent?.groupHeader) {
                groupHeader = firstEvent.groupHeader;
            }
        }

        const constructedDiv = (
            <div className="timeline-date" key={groupKey}>
                {groupEvents && groupKey && <div className="widget-timeline-date-header">{groupHeader}</div>}
                <div
                    className={classNames(
                        "widget-timeline-events-wrapper",
                        !groupEvents || !groupKey ? "widget-timeline-no-divider" : undefined
                    )}
                >
                    <ul>{events}</ul>
                </div>
            </div>
        );
        if (!groupKey) {
            orphanDays.push(constructedDiv);
        } else {
            days.push(constructedDiv);
        }
    });
    if (orphanEventsPlacement === "beginning") {
        days.unshift(orphanDays);
    } else {
        days.push(orphanDays);
    }
    return days;
}

function getBasicEventsFromDay(eventsOfDay: BasicItemType[]): ReactNode[] {
    return eventsOfDay.map((event, index) => (
        <li
            key={index}
            onClick={() => event.action?.execute()}
            className={classNames("widget-timeline-event", event.action ? "clickable" : undefined)}
        >
            <div className="widget-timeline-icon-wrapper">
                {event.icon ? <Icon icon={event.icon} /> : <div className="widget-timeline-icon-circle" />}
            </div>
            <div className="widget-timeline-flex-container widget-timeline-content-wrapper">
                {event.eventDateTime && (
                    <div className="widget-timeline-date-time-wrapper">
                        <p className="widget-eventTime">{event.eventDateTime}</p>
                    </div>
                )}
                <div className="widget-timeline-flex-container widget-timeline-info-wrapper">
                    {event.title && <p className="widget-timeline-title">{event.title}</p>}
                    {event.description && <p className="widget-timeline-description">{event.description}</p>}
                </div>
            </div>
        </li>
    ));
}

function getCustomEventsFromDay(eventsOfDay: CustomItemType[]): JSX.Element[] {
    return eventsOfDay.map((event, index) => (
        <li
            key={index}
            onClick={() => event.action?.execute()}
            className={classNames("widget-timeline-event", event.action ? "clickable" : undefined)}
        >
            <div className="widget-timeline-icon-wrapper">
                {hasChildren(event.icon) ? event.icon : <div className="widget-timeline-icon-circle" />}
            </div>
            <div className="widget-timeline-flex-container widget-timeline-content-wrapper">
                {hasChildren(event.eventDateTime) && (
                    <div className="widget-timeline-date-time-wrapper">{event.eventDateTime}</div>
                )}
                <div className="widget-timeline-flex-container widget-timeline-info-wrapper">
                    {event.title}
                    {event.description}
                </div>
            </div>
        </li>
    ));
}

function hasChildren(element: any): boolean {
    return Children.count((element as ReactElement)?.props.children) > 0;
}
