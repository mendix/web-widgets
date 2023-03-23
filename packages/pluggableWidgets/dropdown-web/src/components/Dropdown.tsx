import classNames from "classnames";
import Downshift from "downshift";
import { createElement, ReactElement, useRef } from "react";
import { ClearButton, DownArrow } from "../assets/icons";
import { useDownshiftProps } from "../hooks/useDownshiftProps";
import { useGetSelector } from "../hooks/useGetSelector";
import { DropdownContainerProps } from "../../typings/DropdownProps";
import { DropdownMenu } from "./DropdownMenu";
import { Placeholder } from "./Placeholder";

export function Dropdown(props: DropdownContainerProps): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLInputElement>(null);
    const selector = useGetSelector(props);
    const downshiftProps = useDownshiftProps(selector, inputRef.current);

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    return (
        <Downshift {...downshiftProps}>
            {({
                selectItem,
                getInputProps,
                getItemProps,
                getMenuProps,
                isOpen,
                highlightedIndex,
                selectedItem,
                getToggleButtonProps
            }) => (
                <div className="widget-dropdown">
                    <div
                        ref={dropdownRef}
                        className={classNames("form-control", "widget-dropdown-input-container", {
                            active: isOpen
                        })}
                        {...getToggleButtonProps()}
                    >
                        <input
                            className="widget-dropdown-input"
                            ref={inputRef}
                            {...getInputProps()}
                            placeholder={selector.caption.get(selector.currentValue)}
                        />

                        {selector.clearable && selector.currentValue !== null && (
                            <button
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    selectItem(null);
                                }}
                            >
                                <div className="widget-dropdown-clear-button">
                                    <ClearButton />
                                </div>
                            </button>
                        )}
                        <div className="widget-dropdown-down-arrow">
                            <DownArrow />
                        </div>
                    </div>
                    <DropdownMenu
                        dropdownSize={dropdownRef.current?.getBoundingClientRect()}
                        selector={selector}
                        getMenuProps={getMenuProps}
                        getItemProps={getItemProps}
                        isOpen={isOpen}
                        selectedItem={selectedItem}
                        highlightedIndex={highlightedIndex}
                    />
                </div>
            )}
        </Downshift>
    );
}
