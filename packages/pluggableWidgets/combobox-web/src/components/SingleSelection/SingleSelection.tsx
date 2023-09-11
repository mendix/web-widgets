import classNames from "classnames";
import { Fragment, ReactElement, createElement, useRef } from "react";
import { ClearButton } from "../../assets/icons";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";
import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { SingleSelectionMenu } from "./SingleSelectionMenu";
import { useEventCallback } from "@mendix/pluggable-widgets-commons";

export function SingleSelection({
    selector,
    tabIndex = 0,
    ...options
}: SelectionBaseProps<SingleSelector>): ReactElement {
    const {
        getInputProps,
        getToggleButtonProps,
        getItemProps,
        selectedItem,
        getMenuProps,
        reset,
        isOpen,
        highlightedIndex,
        openMenu
    } = useDownshiftSingleSelectProps(selector, options);
    const inputRef = useRef<HTMLInputElement>(null);

    const onContainerClick = useEventCallback(() => {
        if (selector?.options.filterType === "no" && !isOpen && inputRef?.current === document.activeElement) {
            openMenu();
        }
    });
    return (
        <Fragment>
            <ComboboxWrapper
                isOpen={isOpen}
                onClick={onContainerClick}
                readOnly={selector.readOnly}
                getToggleButtonProps={getToggleButtonProps}
            >
                <div className="widget-combobox-selected-items">
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": selector.options.filterType === "no"
                        })}
                        tabIndex={tabIndex}
                        {...getInputProps(
                            {
                                disabled: selector.readOnly,
                                readOnly: selector.options.filterType === "no",
                                ref: inputRef
                            },
                            { suppressRefError: true }
                        )}
                        placeholder=" "
                    />
                    <InputPlaceholder isEmpty={!selector.currentValue}>
                        {selector.caption.get(selectedItem)}
                    </InputPlaceholder>
                </div>
                {!selector.readOnly && selector.clearable && selector.currentValue !== null && (
                    <button
                        tabIndex={tabIndex}
                        className="widget-combobox-clear-button"
                        onClick={e => {
                            e.stopPropagation();
                            if (selectedItem) {
                                selector.setValue(null);
                                reset();
                            }
                        }}
                    >
                        <ClearButton />
                    </button>
                )}
            </ComboboxWrapper>
            <SingleSelectionMenu
                selector={selector}
                selectedItem={selectedItem}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
                isOpen={isOpen}
                highlightedIndex={highlightedIndex}
            />
        </Fragment>
    );
}
