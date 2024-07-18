import { useDateSync } from "@mendix/widget-plugin-filtering/helpers/useDateSync";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { useActionEvents } from "../helpers/useActionEvents";
import { useSetup } from "../helpers/useSetup";
import { FilterComponent } from "./FilterComponent";

interface ContainerProps extends DatagridDateFilterContainerProps {
    filterStore: Date_InputFilterInterface;
    parentChannelName?: string;
}

// eslint-disable-next-line prefer-arrow-callback
export const Container: (props: ContainerProps) => React.ReactElement = observer(function Container(props) {
    const staticProps = useSetup({
        defaultEndValue: props.defaultEndDate?.value,
        defaultFilter: props.defaultFilter,
        defaultStartValue: props.defaultStartDate?.value,
        defaultValue: props.defaultValue?.value,
        filterStore: props.filterStore
    });
    const controller = staticProps.controller;
    const state = controller.pickerState;

    useActionEvents({ name: props.name, parentChannelName: props.parentChannelName, controller });

    useDateSync(props, props.filterStore);

    return (
        <FilterComponent
            adjustable={props.adjustable}
            calendarStartDay={staticProps.calendarStartDay}
            class={props.class}
            dateFormat={staticProps.dateFormat}
            disabled={state.disabled}
            endDate={state.endDate}
            expanded={state.expanded}
            filterFn={state.filterFn}
            id={staticProps.id}
            locale={staticProps.locale}
            onButtonKeyDown={controller.handleButtonKeyDown}
            onButtonMouseDown={controller.handleButtonMouseDown}
            onCalendarClose={controller.handleCalendarClose}
            onCalendarOpen={controller.handleCalendarOpen}
            onChange={controller.handlePickerChange}
            onChangeRaw={controller.UNSAFE_handleChangeRaw}
            onFilterChange={controller.handleFilterChange}
            onKeyDown={controller.handleKeyDown}
            pickerRef={controller.pickerRef}
            placeholder={props.placeholder?.value}
            screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
            screenReaderCalendarCaption={props.screenReaderCalendarCaption?.value}
            screenReaderInputCaption={props.screenReaderInputCaption?.value}
            selected={state.selected}
            selectsRange={state.selectsRange}
            startDate={state.startDate}
            style={props.style}
            tabIndex={props.tabIndex ?? 0}
        />
    );
});
