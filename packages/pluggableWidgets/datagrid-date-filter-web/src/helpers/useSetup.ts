import { useState, useMemo, useEffect } from "react";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
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
    controller: DatePickerController;
    dateFormat: string | string[] | undefined;
    id: string;
    locale: string | Locale | undefined;
};

export function useSetup(props: SetupProps): SetupResult {
    const [controller] = useState(
        () =>
            new DatePickerController({
                defaultEnd: props.defaultEndValue,
                defaultFilter: props.defaultFilter,
                defaultStart: props.defaultStartValue,
                defaultValue: props.defaultValue,
                filter: props.filterStore
            })
    );

    useEffect(() => controller.setup(), [controller]);

    return useMemo(() => {
        const locale = getLocale();
        return {
            calendarStartDay: locale.firstDayOfWeek,
            dateFormat: pickerDateFormat(locale),
            controller,
            id: `DateFilter${generateUUID()}`,
            locale: setupLocales(locale)
        };
    }, [controller]);
}
