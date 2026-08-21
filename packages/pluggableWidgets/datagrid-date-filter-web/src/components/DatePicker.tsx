import classNames from "classnames";
import {
    Fragment,
    KeyboardEvent,
    KeyboardEventHandler,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    RefObject,
    useState
} from "react";
import ReactDatePicker, { DatePickerProps as RdpDatePickerProps, DatePicker as RdpDatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "./CalendarIcon";

type InheritedProps = Pick<
    RdpDatePickerProps,
    | "calendarStartDay"
    | "dateFormat"
    | "disabled"
    | "endDate"
    | "locale"
    | "onCalendarClose"
    | "onCalendarOpen"
    | "onChangeRaw"
    | "onKeyDown"
    | "selected"
    | "selectsRange"
    | "startDate"
>;

/**
 * The picker props are a union discriminated on `selectsRange`: the single-date arm
 * hands `onChange` a `Date | null`, the range arm a `[start, end]` tuple. We accept
 * both so one handler stays assignable to whichever arm the filter mode selects.
 */
export type PickerChangeHandler = (
    value: Date | [Date | null, Date | null] | null,
    event?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
) => void;

export interface DatePickerProps extends InheritedProps {
    adjustable: boolean;
    id?: string;
    onChange?: PickerChangeHandler;
    placeholder?: string;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
    pickerRef?: RefObject<RdpDatePicker | null>;
    expanded: boolean;
    onButtonMouseDown?: MouseEventHandler<HTMLButtonElement>;
    onButtonKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
}

export function DatePicker(props: DatePickerProps): ReactElement {
    const staticProps = useSetup();

    return (
        <Fragment>
            <div id={staticProps.portalId} className="date-filter-container" />
            <span className="sr-only" id={`${props.id}-label`}>
                {props.screenReaderInputCaption || "date filter"}
            </span>
            <ReactDatePicker
                {...staticProps}
                popperContainer={({ children }) => (props.expanded ? <div data-overlay-content>{children}</div> : null)}
                allowSameDay={false}
                ariaLabelledBy={`${props.id}-label`}
                autoFocus={false}
                calendarStartDay={props.calendarStartDay}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                dateFormat={props.dateFormat}
                disabled={props.disabled}
                dropdownMode="select"
                enableTabLoop
                endDate={props.endDate}
                isClearable={props.selectsRange}
                locale={props.locale}
                onCalendarClose={props.onCalendarClose}
                onCalendarOpen={props.onCalendarOpen}
                onChange={props.onChange}
                onChangeRaw={props.onChangeRaw}
                onKeyDown={props.onKeyDown}
                placeholderText={props.placeholder}
                ref={props.pickerRef}
                selected={props.selected}
                // Narrow `boolean` to `true | undefined` so the props union resolves to its
                // range arm; the picker treats an absent `selectsRange` as `false` anyway.
                selectsRange={props.selectsRange || undefined}
                shouldCloseOnSelect={false}
                showMonthDropdown
                showPopperArrow={false}
                showYearDropdown
                startDate={props.startDate}
                strictParsing
            />
            <button
                aria-controls={staticProps.portalId}
                aria-expanded={props.expanded}
                aria-haspopup
                aria-label={props.screenReaderCalendarCaption || "Show calendar"}
                className="btn btn-default btn-calendar"
                onMouseDown={props.onButtonMouseDown}
                onKeyDown={props.onButtonKeyDown}
            >
                <CalendarIcon />
            </button>
        </Fragment>
    );
}

type StaticProps = Required<Pick<RdpDatePickerProps, "popperPlacement" | "popperProps" | "portalId">>;

function useSetup(): StaticProps {
    const [props] = useState<StaticProps>(() => {
        return {
            popperPlacement: "bottom-start",
            popperProps: {
                strategy: "fixed"
            },
            portalId: `datepicker_` + Math.random()
        };
    });

    return props;
}
