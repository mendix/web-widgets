import classNames from "classnames";
import { Fragment, ReactElement, createElement, useRef } from "react";
import { ClearButton } from "../../assets/icons";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";
import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { SingleSelectionMenu } from "./SingleSelectionMenu";

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
        highlightedIndex
    } = useDownshiftSingleSelectProps(selector, options);
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <Fragment>
            <ComboboxWrapper isOpen={isOpen} readOnly={selector.readOnly} getToggleButtonProps={getToggleButtonProps}>
                <div className="widget-combobox-selected-items">
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": selector.options.filterType === "none"
                        })}
                        tabIndex={tabIndex}
                        {...getInputProps(
                            {
                                disabled: selector.readOnly,
                                readOnly: selector.options.filterType === "none",
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
