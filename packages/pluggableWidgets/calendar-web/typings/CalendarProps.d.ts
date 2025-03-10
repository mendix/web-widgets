/**
 * This file was generated from Calendar.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";

export type ViewEnum = "standard" | "custom";

export type DefaultViewEnum = "day" | "week" | "month" | "work_week" | "agenda";

export type EditableEnum = "default" | "never";

export type WidthUnitEnum = "pixels" | "percentage";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent" | "percentageOfView";

export type MinHeightUnitEnum = "none" | "pixels" | "percentageOfParent" | "percentageOfView";

export type MaxHeightUnitEnum = "none" | "pixels" | "percentageOfParent" | "percentageOfView";

export type OverflowYEnum = "auto" | "scroll" | "hidden";

export interface CalendarContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    databaseDataSource?: ListValue;
    titleAttribute?: ListAttributeValue<string>;
    allDayAttribute?: ListAttributeValue<boolean>;
    startAttribute?: ListAttributeValue<Date>;
    endAttribute?: ListAttributeValue<Date>;
    eventColor?: ListAttributeValue<string>;
    view: ViewEnum;
    defaultView: DefaultViewEnum;
    startDateAttribute?: EditableValue<Date>;
    editable: EditableEnum;
    enableCreate: boolean;
    eventDataAttribute?: EditableValue<string>;
    onClickEvent?: ActionValue;
    onCreateEvent?: ActionValue;
    onChange?: ActionValue;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    minHeightUnit: MinHeightUnitEnum;
    minHeight: number;
    maxHeightUnit: MaxHeightUnitEnum;
    maxHeight: number;
    OverflowY: OverflowYEnum;
}

export interface CalendarPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    databaseDataSource: {} | { caption: string } | { type: string } | null;
    titleAttribute: string;
    allDayAttribute: string;
    startAttribute: string;
    endAttribute: string;
    eventColor: string;
    view: ViewEnum;
    defaultView: DefaultViewEnum;
    startDateAttribute: string;
    editable: EditableEnum;
    enableCreate: boolean;
    eventDataAttribute: string;
    onClickEvent: {} | null;
    onCreateEvent: {} | null;
    onChange: {} | null;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    minHeightUnit: MinHeightUnitEnum;
    minHeight: number | null;
    maxHeightUnit: MaxHeightUnitEnum;
    maxHeight: number | null;
    OverflowY: OverflowYEnum;
}
