/**
 * This file was generated from Calendar.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, Option, ListAttributeValue, ListExpressionValue } from "mendix";

export type TitleTypeEnum = "attribute" | "expression";

export type ViewEnum = "standard" | "custom";

export type EditableEnum = "default" | "never";

export type DefaultViewEnum = "day" | "week" | "month" | "work_week" | "agenda";

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
    titleType: TitleTypeEnum;
    titleAttribute?: ListAttributeValue<string>;
    titleExpression?: ListExpressionValue<string>;
    allDayAttribute?: ListAttributeValue<boolean>;
    startAttribute?: ListAttributeValue<Date>;
    endAttribute?: ListAttributeValue<Date>;
    eventColor?: ListAttributeValue<string>;
    view: ViewEnum;
    editable: EditableEnum;
    enableCreate: boolean;
    defaultView: DefaultViewEnum;
    startDateAttribute?: EditableValue<Date>;
    eventDataAttribute?: EditableValue<string>;
    onClickEvent?: ActionValue<{ startDate: Option<Date>; endDate: Option<Date>; allDay: Option<boolean>; title: Option<string> }>;
    onCreateEvent?: ActionValue<{ startDate: Option<Date>; endDate: Option<Date>; allDay: Option<boolean> }>;
    onChange?: ActionValue<{ oldStart: Option<Date>; oldEnd: Option<Date>; newStart: Option<Date>; newEnd: Option<Date> }>;
    onRangeChange?: ActionValue<{ rangeStart: Option<Date>; rangeEnd: Option<Date>; currentView: Option<string> }>;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    minHeightUnit: MinHeightUnitEnum;
    minHeight: number;
    maxHeightUnit: MaxHeightUnitEnum;
    maxHeight: number;
    overflowY: OverflowYEnum;
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
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    databaseDataSource: {} | { caption: string } | { type: string } | null;
    titleType: TitleTypeEnum;
    titleAttribute: string;
    titleExpression: string;
    allDayAttribute: string;
    startAttribute: string;
    endAttribute: string;
    eventColor: string;
    view: ViewEnum;
    editable: EditableEnum;
    enableCreate: boolean;
    defaultView: DefaultViewEnum;
    startDateAttribute: string;
    eventDataAttribute: string;
    onClickEvent: {} | null;
    onCreateEvent: {} | null;
    onChange: {} | null;
    onRangeChange: {} | null;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    minHeightUnit: MinHeightUnitEnum;
    minHeight: number | null;
    maxHeightUnit: MaxHeightUnitEnum;
    maxHeight: number | null;
    overflowY: OverflowYEnum;
}
