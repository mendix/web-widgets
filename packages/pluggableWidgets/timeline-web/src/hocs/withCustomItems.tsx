import { ReactElement } from "react";
import { TimelineContainerProps } from "../../typings/TimelineProps";
import { ComponentProps } from "../helpers/types";
import { useCustomItems } from "../helpers/useCustomItems";

type Timeline = (props: TimelineContainerProps) => ReactElement;

export function withCustomItems(Component: (props: ComponentProps) => ReactElement): Timeline {
    return function TimelineCustom(props) {
        return (
            <Component
                class={props.class}
                data={useCustomItems(props)}
                customVisualization
                groupEvents={props.groupEvents}
                ungroupedEventsPosition={props.ungroupedEventsPosition}
            />
        );
    };
}
