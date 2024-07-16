import { useState, useMemo, useEffect } from "react";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering";
import { CalendarStore } from "./CalendarStore";
import { DatePickerController } from "../helpers/DatePickerController";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Locale } from "date-fns";
import { getLocale, pickerDateFormat, setupLocales } from "../utils/date-utils";
import { FilterTypeEnum } from "./base-types";

interface SetupProps {
    filterStore: Date_InputFilterInterface;
    defaultFilter: FilterTypeEnum;
    defaultValue?: Date;
    defaultStartValue?: Date;
    defaultEndValue?: Date;
}

type SetupResult = {
    calendarStartDay: number;
    calendarStore: CalendarStore;
    dateFormat: string | string[] | undefined;
    datePickerController: DatePickerController;
    id: string;
    locale: string | Locale | undefined;
};

export function useSetup(props: SetupProps): SetupResult {
    const [calendarStore] = useState(() => new CalendarStore());
    const [datePickerController] = useState(() => new DatePickerController(props.filterStore, calendarStore));

    // Set default state for the filter.
    useEffect(() => {
        if (props.defaultFilter === "between") {
            props.filterStore.UNSAFE_setDefaults(["between", props.defaultStartValue, props.defaultEndValue]);
        } else {
            props.filterStore.UNSAFE_setDefaults([props.defaultFilter, props.defaultValue]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return useMemo(() => {
        const locale = getLocale();
        return {
            calendarStartDay: locale.firstDayOfWeek,
            calendarStore,
            dateFormat: pickerDateFormat(locale),
            datePickerController,
            id: `DateFilter${generateUUID()}`,
            locale: setupLocales(locale)
        };
    }, [calendarStore, datePickerController]);
}
