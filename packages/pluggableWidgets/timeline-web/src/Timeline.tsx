import { createElement, ReactElement } from "react";
import { TimelineContainerProps } from "../typings/TimelineProps";
import "./ui/Timeline.scss";
import TimelineComponent from "./components/TimelineComponent";
import { withBasicItems } from "./hocs/withBasicItems";
import { withCustomItems } from "./hocs/withCustomItems";

const BasicView = withBasicItems(TimelineComponent);
const CustomView = withCustomItems(TimelineComponent);

export default function Timeline(props: TimelineContainerProps): ReactElement {
    if (props.customVisualization) {
        return <CustomView {...props} />;
    }

    return <BasicView {...props} />;
}
