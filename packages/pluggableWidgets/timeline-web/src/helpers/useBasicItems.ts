import { useMemo } from "react";
import { ObjectItem } from "mendix";
import { TimelineContainerProps } from "../../typings/TimelineProps";
import { getGroup } from "./grouping";
import { BasicItemType, TimelineData } from "./types";

export function useBasicItems(props: TimelineContainerProps): TimelineData {
    return useMemo(
        () => reduceData(props),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            props.groupAttribute,
            props.data,
            props.icon,
            props.title,
            props.timeIndication,
            props.description,
            props.onClick
        ]
    );
}

function reduceData(props: TimelineContainerProps): TimelineData {
    const { items = [] } = props.data;

    return items.reduce<TimelineData>((eventsMap, item) => {
        const group = getGroup(props, item);
        const groupItems = eventsMap.get(group) ?? [];
        groupItems.push(basicItem(props, item));
        eventsMap.set(group, groupItems);
        return eventsMap;
    }, new Map());
}

function basicItem(props: TimelineContainerProps, item: ObjectItem): BasicItemType {
    return {
        icon: props.icon?.value,
        title: props.title?.get(item)?.value,
        eventDateTime: props.timeIndication?.get(item)?.value,
        description: props.description?.get(item)?.value,
        action: props.onClick?.get(item)
    };
}
