import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { DatePickerProps } from "react-datepicker";
import { DateTimePickerContainerProps, TypeEnum } from "typings/DateTimePickerProps";
import { MXSessionLocale } from "../../typings/global";
import { DatePickerController } from "../helpers/DatePickerController";
import { getLocale, pickerDateFormat, setupLocales } from "../utils/date-utils";

export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function useSetupProps(
    {
        tabIndex,
        type,
        dateFormat,
        timeFormat,
        dateTimeFormat,
        placeholder,
        dateAttribute,
        editable,
        ariaRequired,
        onEnter,
        onLeave
    }: DateTimePickerContainerProps,
    controller: DatePickerController
): DatePickerProps {
    const id = `DateFilter${generateUUID()}`;
    const locale = getLocale();
    const calendarStartDay = locale.firstDayOfWeek as Day;
    const calendarLocale = setupLocales(locale);

    const formatProps = formatPropsBuilder(
        type,
        dateFormat,
        timeFormat,
        dateTimeFormat,
        dateAttribute.value ?? new Date(),
        null,
        locale
    );

    const popperProps: Pick<
        DatePickerProps,
        "popperPlacement" | "popperProps" | "showPopperArrow" | "popperModifiers"
    > = {
        popperPlacement: "bottom-start",
        popperProps: {
            strategy: "fixed",
            transform: false
        },
        showPopperArrow: false,
        popperModifiers: [
            {
                name: "computeStyles",
                options: {
                    gpuAcceleration: false
                },
                fn: () => ({})
            }
        ]
    };

    return {
        // Static props
        allowSameDay: false,
        autoFocus: false,
        calendarClassName: "widget-datetimepicker-calendar",
        className: "widget-datetimepicker-input",
        dropdownMode: "select",
        enableTabLoop: true,
        shouldCloseOnSelect: false,
        showMonthDropdown: true,
        showYearDropdown: true,
        strictParsing: true,
        useWeekdaysShort: false,

        // Base props
        ariaLabelledBy: `${id}-label`,
        ariaRequired: ariaRequired.toString(),
        disabled: editable === "never",
        locale: calendarLocale,
        placeholderText: placeholder?.status === "available" ? placeholder.value : "",
        tabIndex: tabIndex ?? 0,

        // Formatting props
        calendarStartDay,
        ...formatProps,

        // Events props
        onBlur: () => onLeave?.canExecute && !onLeave.isExecuting && onLeave.execute(),
        onCalendarClose: controller.handleCalendarClose,
        onCalendarOpen: controller.handleCalendarOpen,
        onChange: controller.handlePickerChange,
        onChangeRaw: controller.UNSAFE_handleChangeRaw,
        onFocus: () => onEnter?.canExecute && !onEnter.isExecuting && onEnter.execute(),
        onKeyDown: controller.handleKeyDown,

        // Popper props
        ...popperProps
    };
}

function formatPropsBuilder(
    type: TypeEnum,
    dateFormat: string,
    timeFormat: string,
    dateTimeFormat: string,
    date: Date,
    endDate: Date | null,
    locale: MXSessionLocale
): Omit<DatePickerProps, "onChange"> {
    switch (type) {
        case "date":
            return {
                dateFormat: dateFormat || pickerDateFormat(locale),
                showTimeSelect: false,
                showTimeSelectOnly: false,
                selected: date
            };
        case "time":
            return {
                dateFormat: timeFormat || "h:mm aa",
                showTimeSelect: true,
                showTimeSelectOnly: true,
                timeIntervals: 15,
                timeCaption: "Time",
                selected: date
            };
        case "datetime":
            return {
                dateFormat: dateTimeFormat || pickerDateFormat(locale),
                showTimeSelect: true,
                timeIntervals: 15,
                timeCaption: "Time",
                timeFormat: timeFormat || "h:mm aa",
                selected: date
            };
        case "range":
            return {
                dateFormat: dateFormat || pickerDateFormat(locale),
                selected: date,
                isClearable: true,
                selectsRange: true,
                startDate: date,
                endDate: endDate
            };
    }
}
