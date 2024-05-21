import { createElement, Fragment, ReactElement, useState } from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import classNames from "classnames";
import { pickerDateFormat, setupLocales } from "../utils/date-utils";
import CalendarIcon from "./CalendarIcon";
import { DatePickerController } from "../helpers/DatePickerController";
import { FilterStore } from "../helpers/store/FilterStore";
import { PopupStore } from "../helpers/store/PopupStore";
import { usePickerState } from "../helpers/usePickerState";

interface DatePickerProps {
    adjustable: boolean;
    datePickerController: DatePickerController;
    filterStore: FilterStore;
    parentId?: string;
    placeholder?: string;
    popupStore: PopupStore;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
}

export function DatePicker(props: DatePickerProps): ReactElement {
    const staticProps = useSetup();
    const { datePickerController: controller } = props;
    const state = usePickerState(props.filterStore, props.popupStore);

    return (
        <Fragment>
            <div ref={controller.popoverContainerRef} id={staticProps.portalId} className="date-filter-container" />
            <span className="sr-only" id={`${props.parentId}-label`}>
                {props.screenReaderInputCaption}
            </span>
            <ReactDatePicker
                allowSameDay={false}
                autoFocus={false}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={state.useRangeMode}
                disabledKeyboardNavigation={false}
                dropdownMode="select"
                enableTabLoop
                isClearable={state.useRangeMode}
                onCalendarOpen={controller.handleCalendarOpen}
                onChange={controller.handlePickerChange}
                onClickOutside={controller.handlePickerOutsideClick}
                onInputClick={controller.handlePickerInputClick}
                placeholderText={props.placeholder}
                preventOpenOnFocus
                readOnly={state.useRangeMode}
                ref={controller.pickerRef}
                selectsRange={state.useRangeMode}
                shouldCloseOnSelect={false}
                showMonthDropdown
                showPopperArrow={false}
                showYearDropdown
                strictParsing
                useWeekdaysShort={false}
                startDate={state.startDate}
                endDate={state.endDate}
                selected={state.selected}
                open={state.open}
            />
            <button
                aria-controls={staticProps.portalId}
                aria-expanded={state.open}
                aria-haspopup
                aria-label={props.screenReaderCalendarCaption ?? "Show calendar"}
                ref={controller.buttonRef}
                className="btn btn-default btn-calendar"
                onClick={controller.handleButtonClick}
                onKeyDown={controller.handleButtonKeyDown}
            >
                <CalendarIcon />
            </button>
        </Fragment>
    );
}

type StaticProps = Omit<ReactDatePickerProps, "onChange">;

function useSetup(): StaticProps {
    const [props] = useState<StaticProps>(() => {
        const { locale } = window.mx.session.getConfig();
        return {
            calendarStartDay: locale.firstDayOfWeek,
            dateFormat: pickerDateFormat(locale),
            locale: setupLocales(locale),
            popperPlacement: "bottom-end",
            popperProps: {
                strategy: "fixed"
            },
            portalId: `datepicker_` + Math.random()
        };
    });

    return props;
}
