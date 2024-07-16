import { useState, useMemo } from "react";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering";
import { CalendarStore } from "../helpers/store/CalendarStore";
import { DatePickerController } from "../helpers/DatePickerController";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Locale } from "date-fns";
import { getLocale, pickerDateFormat, setupLocales } from "../utils/date-utils";

interface SetupProps {
    filterStore: Date_InputFilterInterface;
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
