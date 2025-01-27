import classNames from "classnames";
import { Fragment, ReactElement, createElement, useMemo, useRef } from "react";
import { ClearButton } from "../../assets/icons";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";
import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { useLazyLoading } from "../../hooks/useLazyLoading";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { SingleSelectionMenu } from "./SingleSelectionMenu";

export function SingleSelection({
    selector,
    tabIndex = 0,
    a11yConfig,
    keepMenuOpen,
    menuFooterContent,
    ariaRequired,
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
    } = useDownshiftSingleSelectProps(selector, options, a11yConfig.a11yStatusMessage);
    const inputRef = useRef<HTMLInputElement>(null);
    const lazyLoading = selector.lazyLoading ?? false;
    const { onScroll } = useLazyLoading({
        hasMoreItems: selector.options.hasMore ?? false,
        isInfinite: lazyLoading,
        isOpen,
        loadMore: () => {
            if (selector.options.loadMore) {
                selector.options.loadMore();
            }
        },
        datasourceFilter: selector.options.datasourceFilter,
        readOnly: selector.readOnly
    });

    const selectedItemCaption = useMemo(
        () => selector.caption.render(selectedItem, "label"),
        [
            selectedItem,
            selector.status,
            selector.caption,
            selector.caption.emptyCaption,
            selector.currentId,
            selector.caption.formatter
        ]
    );

    return (
        <Fragment>
            <ComboboxWrapper
                isOpen={isOpen || keepMenuOpen === true}
                readOnly={selector.readOnly}
                readOnlyStyle={options.readOnlyStyle}
                getToggleButtonProps={getToggleButtonProps}
                validation={selector.validation}
                isLoading={lazyLoading && selector.options.isLoading}
            >
                <div
                    className={classNames("widget-combobox-selected-items", {
                        "widget-combobox-custom-content": selector.customContentType === "yes"
                    })}
                >
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": selector.options.filterType === "none"
                        })}
                        tabIndex={tabIndex}
                        {...getInputProps(
                            {
                                disabled: selector.readOnly,
                                readOnly: selector.options.filterType === "none",
                                ref: inputRef,
                                "aria-required": ariaRequired
                            },
                            { suppressRefError: true }
                        )}
                        placeholder=" "
                    />
                    <InputPlaceholder
                        isEmpty={!selector.currentId || !selector.caption.render(selectedItem, "label")}
                        type={selector.customContentType === "yes" ? "custom" : "text"}
                    >
                        {selectedItemCaption}
                    </InputPlaceholder>
                </div>
                {((!selector.readOnly && selector.clearable && selector.currentId !== null) ||
                    (selector.selectorType === "static" &&
                        selector.currentId !== null &&
                        !selector.readOnly &&
                        selector.clearable &&
                        selector.attributeType !== "boolean")) && (
                    <button
                        tabIndex={tabIndex}
                        className="widget-combobox-clear-button"
                        aria-label={a11yConfig.ariaLabels?.clearSelection}
                        onClick={e => {
                            e.stopPropagation();
                            inputRef.current?.focus();
                            if (selectedItem || selector.selectorType === "static") {
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
                isOpen={isOpen || keepMenuOpen === true}
                highlightedIndex={highlightedIndex}
                menuFooterContent={menuFooterContent}
                noOptionsText={options.noOptionsText}
                alwaysOpen={keepMenuOpen}
                isLoading={selector.options.isLoading}
                lazyLoading={lazyLoading}
                onScroll={onScroll}
            />
        </Fragment>
    );
}
