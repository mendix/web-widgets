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

export interface ComponentProps {
    class?: string;
    data: Map<string, ItemType[]>;
    customVisualization: boolean;
    groupEvents: boolean;
    onClick?: ActionValue;
    ungroupedEventsPosition: UngroupedEventsPositionEnum;
}
