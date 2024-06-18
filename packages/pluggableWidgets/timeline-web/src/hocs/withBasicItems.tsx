import { createElement } from "react";
import { TimelineContainerProps } from "../../typings/TimelineProps";
import { ComponentProps } from "../helpers/types";
import { useBasicItems } from "../helpers/useBasicItems";

type Timeline = (props: TimelineContainerProps) => React.ReactElement;

export function withBasicItems(Component: (props: ComponentProps) => React.ReactElement): Timeline {
    return function TimelineBasic(props) {
        return (
            <Component
                class={props.class}
                data={useBasicItems(props)}
                customVisualization={false}
                groupEvents={props.groupEvents}
                ungroupedEventsPosition={props.ungroupedEventsPosition}
            />
        );
    };
}
