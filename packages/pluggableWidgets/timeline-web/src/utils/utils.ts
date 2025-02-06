import {
    GroupByDayOptionsEnum,
    GroupByKeyEnum,
    GroupByMonthOptionsEnum,
    TimelineContainerProps
} from "../../typings/TimelineProps";

export type GroupHeaderConfig = Pick<
    TimelineContainerProps,
    "groupByKey" | "groupByDayOptions" | "groupByMonthOptions"
>;

export function getHeaderOption({
    groupByKey,
    groupByDayOptions,
    groupByMonthOptions
}: GroupHeaderConfig): "year" | GroupByDayOptionsEnum | GroupByMonthOptionsEnum {
    return groupByKey === "day" ? groupByDayOptions : groupByKey === "month" ? groupByMonthOptions : "year";
}

export function getGroupByMethodForCustomMode(groupByKey: GroupByKeyEnum): GroupByMonthOptionsEnum | GroupByKeyEnum {
    if (groupByKey === "month") {
        return "monthYear";
    }

    return groupByKey;
}
