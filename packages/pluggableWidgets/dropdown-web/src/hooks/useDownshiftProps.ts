import { useMemo } from "react";
import Downshift, { DownshiftState, StateChangeOptions } from "downshift";
import { SingleSelector } from "../helpers/types";
import { DropdownContainerProps } from "typings/DropdownProps";
import { executeAction } from "@mendix/pluggable-widgets-commons";

export function useDownshiftProps(
    selector: SingleSelector,
    inputElement: HTMLInputElement | null,
    props: DropdownContainerProps
) {
    return useMemo(() => {
        return {
            itemToString: (v: string | null) => selector.caption.get(v),
            onChange: (v: string | null) => selector.setValue(v),
            onClick: (): void => executeAction(props.onClickEvent),
            onMouseEnter: (): void => executeAction(props.onEnterEvent),
            onMouseLeave: (): void => executeAction(props.onLeaveEvent),
            onInputValueChange: (v: string) => selector.options.setSearchTerm(v),
            onStateChange: (state: StateChangeOptions<string>) => {
                if (state.type === Downshift.stateChangeTypes.clickButton && state.isOpen) {
                    inputElement?.focus();
                }
            },
            initialInputValue: selector.caption.get(selector.currentValue),
            stateReducer: (_state: DownshiftState<string>, changes: StateChangeOptions<string>) => {
                switch (changes.type) {
                    case Downshift.stateChangeTypes.clickButton:
                        return {
                            ...changes,
                            inputValue: ""
                        };
                    case Downshift.stateChangeTypes.keyDownEnter:
                    case Downshift.stateChangeTypes.clickItem:
                        return {
                            ...changes
                        };
                    default:
                        return changes;
                }
            }
        };
    }, [selector, inputElement, props.onClickEvent, props.onEnterEvent, props.onLeaveEvent]);
}
