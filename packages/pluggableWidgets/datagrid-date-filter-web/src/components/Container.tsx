import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { usePickerState } from "../helpers/usePickerState";
import { useSetup } from "../helpers/useSetup";
import { FilterComponent } from "./FilterComponent";

interface ContainerProps extends DatagridDateFilterContainerProps {
    filterStore: Date_InputFilterInterface;
}

// eslint-disable-next-line prefer-arrow-callback
export const Container: (props: ContainerProps) => React.ReactElement = observer(function Container(props) {
    const {
        calendarStore,
        datePickerController: controller,
        ...staticProps
    } = useSetup({ filterStore: props.filterStore });
    const state = usePickerState(props.filterStore, calendarStore);
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
            onFilterChange={props.filterStore.setFilterFn}
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
