import { useMemo } from "react";
import { ObjectItem } from "mendix";
import { TimelineContainerProps } from "../../typings/TimelineProps";
import { getGroup } from "./grouping";
import { CustomItemType, TimelineData } from "./types";

export function useCustomItems(props: TimelineContainerProps): TimelineData {
    return useMemo(
        () => reduceData(props),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            props.groupAttribute,
            props.data,
            props.customIcon,
            props.customGroupHeader,
            props.customTitle,
            props.customEventDateTime,
            props.customDescription,
            props.onClick
        ]
    );
}

function reduceData(props: TimelineContainerProps): TimelineData {
    const { items = [] } = props.data;

    return items.reduce<TimelineData>((eventsMap, item) => {
        const group = getGroup(props, item);
        const groupItems = eventsMap.get(group) ?? [];
        groupItems.push(customItem(props, item));
        eventsMap.set(group, groupItems);
        return eventsMap;
    }, new Map());
}

function customItem(props: TimelineContainerProps, item: ObjectItem): CustomItemType {
    return {
        icon: props.customIcon?.get(item),
        groupHeader: props.customGroupHeader?.get(item),
        title: props.customTitle?.get(item),
        eventDateTime: props.customEventDateTime?.get(item),
        description: props.customDescription?.get(item),
        action: props.onClick?.get(item)
    };
}
