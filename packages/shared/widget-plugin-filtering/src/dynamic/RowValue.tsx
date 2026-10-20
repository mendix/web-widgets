import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { FilterFunctionString } from "@mendix/filter-commons/typings/FilterFunctions";
import { EnumFilterContainer } from "@mendix/widget-plugin-dropdown-filter/containers/EnumFilterContainer";
import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { DynamicFilterRow } from "./DynamicFilterSet";
import { NumberFilterController } from "../controllers/input/NumberInputController";
import { StringFilterController } from "../controllers/input/StringInputController";
import { DateFilterComponent, DateFilterFn } from "../controls/date-picker/DateFilterComponent";
import { useDatePickerSetup } from "../controls/date-picker/useDatePickerSetup";
import { InputWithFilters } from "../controls/input/InputWithFilters";
import { FilterFnList } from "../controls/input/typings";
import {
    Date_InputFilterInterface,
    FilterFn,
    Number_InputFilterInterface,
    String_InputFilterInterface
} from "../typings/InputFilterInterface";

type NumberFn = FilterFn<Number_InputFilterInterface>;
type StringFn = FilterFn<String_InputFilterInterface>;

const numberFns: FilterFnList<NumberFn> = [
    { value: "greater", label: "Greater than" },
    { value: "greaterEqual", label: "Greater than or equal" },
    { value: "equal", label: "Equal" },
    { value: "notEqual", label: "Not equal" },
    { value: "smaller", label: "Smaller than" },
    { value: "smallerEqual", label: "Smaller than or equal" },
    { value: "empty", label: "Empty" },
    { value: "notEmpty", label: "Not empty" }
];

const stringOnlyFns: FilterFnList<FilterFunctionString> = [
    { value: "contains", label: "Contains" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" }
];

const stringFns: FilterFnList<StringFn> = [...stringOnlyFns, ...numberFns];

const isNonValue = (fn: string): boolean => fn === "empty" || fn === "notEmpty";

interface Props {
    row: DynamicFilterRow;
    name: string;
    /** Field label, used as the accessible name of the value control. */
    label: string;
}

/** The operator and value controls of one row, reusing the filter widgets' controls. */
export const RowValue = observer(function RowValue({ row, name, label }: Props): ReactElement | null {
    const { store, kind } = row;
    if (!store || !kind) {
        return null;
    }
    switch (kind) {
        case "text":
            return <TextValue store={store as String_InputFilterInterface} name={name} label={label} />;
        case "number":
            return <NumberValue store={store as Number_InputFilterInterface} name={name} label={label} />;
        case "date":
            return <DateValue store={store as Date_InputFilterInterface} label={label} />;
        case "enum":
            return <EnumValue store={store as EnumFilterStore} name={name} label={label} />;
    }
});

const TextValue = observer(function TextValue(props: {
    store: String_InputFilterInterface;
    name: string;
    label: string;
}): ReactElement {
    const ctrl = useSetup(
        () =>
            new StringFilterController({
                filter: props.store,
                defaultFilter: "contains",
                adjustableFilterFunction: true,
                disableInputs: isNonValue
            })
    );
    return (
        <InputWithFilters
            adjustable
            disableInputs={ctrl.disableInputs}
            filterFn={ctrl.selectedFn}
            filterFnList={stringFns}
            inputRef={ctrl.inputRef}
            inputStores={ctrl.inputs}
            name={props.name}
            onFilterChange={ctrl.handleFilterFnChange}
            screenReaderInputCaption={props.label}
        />
    );
});

const NumberValue = observer(function NumberValue(props: {
    store: Number_InputFilterInterface;
    name: string;
    label: string;
}): ReactElement {
    const ctrl = useSetup(
        () =>
            new NumberFilterController({
                filter: props.store,
                defaultFilter: "equal",
                adjustableFilterFunction: true,
                disableInputs: isNonValue
            })
    );
    return (
        <InputWithFilters
            adjustable
            disableInputs={ctrl.disableInputs}
            filterFn={ctrl.selectedFn}
            filterFnList={numberFns}
            inputRef={ctrl.inputRef}
            inputStores={ctrl.inputs}
            name={props.name}
            onFilterChange={ctrl.handleFilterFnChange}
            screenReaderInputCaption={props.label}
        />
    );
});

const DateValue = observer(function DateValue(props: {
    store: Date_InputFilterInterface;
    label: string;
}): ReactElement {
    const setup = useDatePickerSetup({
        filterStore: props.store,
        defaultFilter: "equal" as DateFilterFn,
        adjustableFilterFunction: true
    });
    const ctrl = setup.controller;
    const state = ctrl.pickerState;
    return (
        <DateFilterComponent
            adjustable
            calendarStartDay={setup.calendarStartDay}
            class=""
            dateFormat={setup.dateFormat}
            disabled={state.disabled}
            endDate={state.endDate}
            expanded={state.expanded}
            filterFn={state.filterFn}
            id={setup.id}
            locale={setup.locale}
            onButtonKeyDown={ctrl.handleButtonKeyDown}
            onButtonMouseDown={ctrl.handleButtonMouseDown}
            onCalendarClose={ctrl.handleCalendarClose}
            onCalendarOpen={ctrl.handleCalendarOpen}
            onChange={ctrl.handlePickerChange}
            onChangeRaw={ctrl.UNSAFE_handleChangeRaw}
            onFilterChange={ctrl.handleFilterChange}
            onKeyDown={ctrl.handleKeyDown}
            pickerRef={ctrl.pickerRef}
            screenReaderInputCaption={props.label}
            selected={state.selected}
            selectsRange={state.selectsRange}
            startDate={state.startDate}
        />
    );
});

function EnumValue(props: { store: EnumFilterStore; name: string; label: string }): ReactElement {
    return (
        <EnumFilterContainer
            ariaLabel={props.label}
            clearable
            emptyOptionCaption=""
            emptySelectionCaption=""
            filterable={false}
            filterOptions={[]}
            filterStore={props.store}
            multiselect
            name={props.name}
            parentChannelName={undefined}
            placeholder=""
            selectedItemsStyle="text"
            selectionMethod="checkbox"
        />
    );
}
