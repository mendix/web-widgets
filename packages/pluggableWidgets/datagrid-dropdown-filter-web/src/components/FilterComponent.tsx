import { useWatchValues } from "@mendix/widget-plugin-hooks/useWatchValues";
import { createElement, CSSProperties, ReactElement, UIEventHandler, useCallback, useEffect } from "react";
import { useSelectState } from "../features/select";
import { EMPTY_OPTION_VALUE, finalizeOptions, parseInitValues } from "../features/setup";
import { Option } from "../utils/types";
import { SelectComponent } from "./SelectComponent";
import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { SetFilterValueArgs } from "@mendix/widget-plugin-external-events/typings";

export interface FilterComponentProps {
    ariaLabel?: string;
    className?: string;
    initialSelected?: string;
    status?: JSX.Element;
    footer?: JSX.Element;
    emptyOptionCaption?: string;
    multiSelect?: boolean;
    id?: string;
    options: Option[];
    tabIndex?: number;
    styles?: CSSProperties;
    updateFilters?: (values: Option[], isInitialChange?: boolean) => void;
    onTriggerClick?: () => void;
    onContentScroll?: UIEventHandler<HTMLUListElement>;
    name: string;
    parentChannelName: string | null;
}

export function FilterComponent(props: FilterComponentProps): ReactElement {
    const multiSelect = !!props.multiSelect;
    const options = finalizeOptions(props.options, { multiSelect, emptyOptionCaption: props.emptyOptionCaption });
    const [state, { toggle, setSelected, reset }] = useSelectState(
        options,
        parseInitValues(props.initialSelected ?? "")
    );

    const onSelect = useCallback((value: string) => {
        if (multiSelect) {
            toggle(value);
        } else {
            setSelected(value === EMPTY_OPTION_VALUE ? [] : [value]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useSetInitialConditionEffect(props.updateFilters, options, state.selected);

    useWatchValues(
        (_, [selected]) => {
            props.updateFilters?.(selected.length > 0 ? options.filter(o => selected.includes(o.value)) : []);
        },
        [state.selected]
    );

    useOnResetValueEvent({
        widgetName: props.name,
        parentChannelName: props.parentChannelName ?? undefined,
        listener: reset
    });

    useOnSetValueEvent({
        widgetName: props.name,
        listener: (useDefaultValue: boolean, valueOptions: SetFilterValueArgs) => {
            if (useDefaultValue) {
                reset([useDefaultValue]);
            } else {
                setSelected([valueOptions.stringValue]);
            }
        }
    });

    return (
        <SelectComponent
            ariaLabel={props.ariaLabel}
            className={props.className}
            footer={props.footer}
            id={props.id}
            inputValue={state.inputValue}
            multiSelect={multiSelect}
            onSelect={onSelect}
            options={options}
            selected={state.selected}
            status={props.status}
            styles={props.styles}
            tabIndex={props.tabIndex}
            placeholder={props.emptyOptionCaption}
            onContentScroll={props.onContentScroll}
            onTriggerClick={props.onTriggerClick}
        />
    );
}

function useSetInitialConditionEffect(
    updateFilters: ((values: Option[], isInitialChange?: boolean) => void) | undefined,
    options: Option[],
    selected: string[]
): void {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(
        () =>
            updateFilters?.(
                options.filter(o => selected.includes(o.value)),
                true
            ),
        []
    );
}
