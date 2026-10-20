import { Locale } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DatePickerProps } from "react-datepicker";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { getLocale, pickerDateFormat, setupLocales } from "./date-utils";
import { DateFilterFn } from "./DateFilterComponent";
import { DatePickerController } from "./DatePickerController";
import { Date_InputFilterInterface } from "../../typings/InputFilterInterface";

export interface DatePickerSetupProps {
    filterStore: Date_InputFilterInterface;
    defaultFilter: DateFilterFn;
    adjustableFilterFunction: boolean;
    defaultValue?: Date;
    defaultStartValue?: Date;
    defaultEndValue?: Date;
}

export type DatePickerSetupResult = {
    calendarStartDay: DatePickerProps["calendarStartDay"];
    controller: DatePickerController;
    dateFormat: string | string[] | undefined;
    id: string;
    locale: string | Locale | undefined;
};

export function useDatePickerSetup(props: DatePickerSetupProps): DatePickerSetupResult {
    const [controller] = useState(
        () =>
            new DatePickerController({
                defaultEnd: props.defaultEndValue,
                defaultFilter: props.defaultFilter,
                adjustableFilterFunction: props.adjustableFilterFunction,
                defaultStart: props.defaultStartValue,
                defaultValue: props.defaultValue,
                filter: props.filterStore
            })
    );

    useEffect(() => controller.setup(), [controller]);

    return useMemo(() => {
        const locale = getLocale();
        return {
            calendarStartDay: locale.firstDayOfWeek as DatePickerProps["calendarStartDay"],
            dateFormat: pickerDateFormat(locale),
            controller,
            id: `DateFilter${generateUUID()}`,
            locale: setupLocales(locale)
        };
    }, [controller]);
}
