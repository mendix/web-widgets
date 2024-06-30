import { ReactNode } from "react";
import { ActionValue, WebIcon } from "mendix";
import { UngroupedEventsPositionEnum } from "../../typings/TimelineProps";

export interface BasicItemType {
    icon?: WebIcon;
    title?: string;
    eventDateTime?: string;
    description?: string;
    action?: ActionValue;
}

export interface CustomItemType {
    icon?: ReactNode;
    title?: ReactNode;
    eventDateTime?: ReactNode;
    description?: ReactNode;
    action?: ActionValue;
    groupHeader?: ReactNode;
}

export type ItemType = BasicItemType | CustomItemType;

export type TimelineData = Map<string, ItemType[]>;
export interface ComponentProps {
    class?: string;
    data: TimelineData;
    customVisualization: boolean;
    groupEvents: boolean;
    onClick?: ActionValue;
    ungroupedEventsPosition: UngroupedEventsPositionEnum;
}
