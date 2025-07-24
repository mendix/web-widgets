/**
 * This file was generated from Calendar.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, ListValue, Option, ListActionValue, ListAttributeValue, ListExpressionValue } from "mendix";

export type TitleTypeEnum = "attribute" | "expression";

export type ViewEnum = "standard" | "custom";

export type DefaultViewStandardEnum = "day" | "week" | "month";

export type DefaultViewCustomEnum = "day" | "week" | "month" | "work_week" | "agenda";

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
    startDateAttribute?: ListAttributeValue<Date>;
    editable: DynamicValue<boolean>;
    view: ViewEnum;
    defaultViewStandard: DefaultViewStandardEnum;
    defaultViewCustom: DefaultViewCustomEnum;
    showEventDate: DynamicValue<boolean>;
    timeFormat?: DynamicValue<string>;
    minHour: number;
    maxHour: number;
    showAllEvents: boolean;
    customViewShowDay: boolean;
    customViewShowWeek: boolean;
    customViewShowCustomWeek: boolean;
    customViewCaption?: DynamicValue<string>;
    customViewShowMonth: boolean;
    customViewShowAgenda: boolean;
    customViewShowMonday: boolean;
    customViewShowTuesday: boolean;
    customViewShowWednesday: boolean;
    customViewShowThursday: boolean;
    customViewShowFriday: boolean;
    customViewShowSaturday: boolean;
    customViewShowSunday: boolean;
    onEditEvent?: ListActionValue;
    onCreateEvent?: ActionValue<{ startDate: Option<Date>; endDate: Option<Date>; allDay: Option<boolean> }>;
    onDragDropResize?: ListActionValue<{ oldStart: Option<Date>; oldEnd: Option<Date>; newStart: Option<Date>; newEnd: Option<Date> }>;
    onViewRangeChange?: ActionValue<{ rangeStart: Option<Date>; rangeEnd: Option<Date>; currentView: Option<string> }>;
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
    startDateAttribute: string;
    editable: string;
    view: ViewEnum;
    defaultViewStandard: DefaultViewStandardEnum;
    defaultViewCustom: DefaultViewCustomEnum;
    showEventDate: string;
    timeFormat: string;
    minHour: number | null;
    maxHour: number | null;
    showAllEvents: boolean;
    customViewShowDay: boolean;
    customViewShowWeek: boolean;
    customViewShowCustomWeek: boolean;
    customViewCaption: string;
    customViewShowMonth: boolean;
    customViewShowAgenda: boolean;
    customViewShowMonday: boolean;
    customViewShowTuesday: boolean;
    customViewShowWednesday: boolean;
    customViewShowThursday: boolean;
    customViewShowFriday: boolean;
    customViewShowSaturday: boolean;
    customViewShowSunday: boolean;
    onEditEvent: {} | null;
    onCreateEvent: {} | null;
    onDragDropResize: {} | null;
    onViewRangeChange: {} | null;
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
