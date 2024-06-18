import { DateTimeFormatterConfig, ListAttributeValue, ObjectItem } from "mendix";
import {
    GroupByDayOptionsEnum,
    GroupByKeyEnum,
    GroupByMonthOptionsEnum,
    TimelineContainerProps
} from "../../typings/TimelineProps";

type GroupingMethod = GroupByKeyEnum | GroupByDayOptionsEnum | GroupByMonthOptionsEnum;

export type GroupHeaderConfig = Pick<
    TimelineContainerProps,
    "groupByKey" | "groupByDayOptions" | "groupByMonthOptions"
>;

export function getGroupingMethodForBasicMode({
    groupByKey,
    groupByDayOptions,
    groupByMonthOptions
}: GroupHeaderConfig): GroupingMethod {
    return groupByKey === "day" ? groupByDayOptions : groupByKey === "month" ? groupByMonthOptions : "year";
}

export function getGroupingMethodForCustomMode({
    groupByKey
}: GroupHeaderConfig): GroupByMonthOptionsEnum | GroupByKeyEnum {
    if (groupByKey === "month") {
        return "monthYear";
    }

    return groupByKey;
}

export function getFormatConfigByGroupingMethod(
    method: GroupByDayOptionsEnum | GroupByMonthOptionsEnum | GroupByKeyEnum
): DateTimeFormatterConfig {
    switch (method) {
        case "dayName":
            return { type: "custom", pattern: "EEEE" };
        case "dayMonth":
            return { type: "custom", pattern: "dd MMMM" };
        case "month":
            return { type: "custom", pattern: "MMMM" };
        case "monthYear":
            return { type: "custom", pattern: "MMM YYYY" };
        case "year":
            return { type: "custom", pattern: "YYYY" };
        default:
            return { type: "date" };
    }
}

interface GroupKeyParams {
    groupAttribute: ListAttributeValue<Date>;
    customVisualization: boolean;
    groupByKey: GroupByKeyEnum;
    groupByDayOptions: GroupByDayOptionsEnum;
    groupByMonthOptions: GroupByMonthOptionsEnum;
}

function groupKey(params: GroupKeyParams, item: ObjectItem): string {
    const { groupAttribute, customVisualization } = params;
    const method = customVisualization ? getGroupingMethodForCustomMode(params) : getGroupingMethodForBasicMode(params);
    const config = getFormatConfigByGroupingMethod(method);
    const date = groupAttribute.get(item);
    if (date.formatter.type === "datetime") {
        return date.formatter.withConfig(config).format(date.value);
    }
    return "";
}

export function getGroup(props: TimelineContainerProps, item: ObjectItem): string {
    if (props.groupEvents && props.groupAttribute !== undefined) {
        return groupKey({ ...props, groupAttribute: props.groupAttribute }, item);
    }

    return "";
}
