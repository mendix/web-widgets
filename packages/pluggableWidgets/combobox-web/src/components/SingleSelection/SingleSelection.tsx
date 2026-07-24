import classNames from "classnames";
import { Fragment, KeyboardEventHandler, ReactElement, useMemo, useRef } from "react";
import { ClearButton } from "../../assets/icons";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";
import { getComboboxAriaLabels, getInputLabel, getValidationErrorId } from "../../helpers/utils";
import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { useFloatingMenu } from "../../hooks/useFloatingMenu";
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
        highlightedIndex,
        selectItem
    } = useDownshiftSingleSelectProps(selector, options, a11yConfig.a11yStatusMessage);
    const inputRef = useRef<HTMLInputElement>(null);
    const { refs, floatingStyles } = useFloatingMenu(keepMenuOpen === true ? false : isOpen);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            selectedItem,
            selector.status,
            selector.caption,
            selector.caption.emptyCaption,
            selector.currentId,
            selector.caption.formatter
        ]
    );

    const errorId = getValidationErrorId(options.inputId);
    const onInputKeyDown = useMemo<KeyboardEventHandler<HTMLInputElement> | undefined>(() => {
        if (!selector.clearable) {
            return undefined;
        }

        return e => {
            if (e.key === "Backspace" && e.currentTarget.value === "") {
                selectItem(null);
            }
        };
    }, [selector.clearable, selectItem]);

    const inputProps = getInputProps(
        {
            disabled: selector.readOnly,
            readOnly: selector.options.filterType === "none",
            ref: inputRef,
            "aria-required": ariaRequired.value,
            onKeyDown: onInputKeyDown
        },
        { suppressRefError: true }
    );

    const inputLabel = getInputLabel(options.inputId);
    const ariaLabels = useMemo(
        () =>
            getComboboxAriaLabels({
                isOpen,
                hasSelection: Boolean(selectedItem),
                selectedValue: selectedItem ? selector.caption.get(selectedItem) : "",
                inputLabel,
                labelledBy: inputProps["aria-labelledby"],
                fallbackAriaLabel: options.ariaLabel
            }),
        [isOpen, selectedItem, inputLabel, inputProps, options.ariaLabel, selector.caption]
    );

    return (
        <Fragment>
            <ComboboxWrapper
                ref={refs.setReference}
                isOpen={isOpen || keepMenuOpen === true}
                readOnly={selector.readOnly}
                readOnlyStyle={options.readOnlyStyle}
                getToggleButtonProps={getToggleButtonProps}
                validation={selector.validation}
                isLoading={lazyLoading && selector.options.isLoading}
                errorId={errorId}
            >
                <div
                    className={classNames("widget-combobox-selected-items", {
                        "widget-combobox-custom-content": selector.customContentType === "yes"
                    })}
                >
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter":
                                selector.options.filterType === "none" || selector.readOnly
                        })}
                        tabIndex={tabIndex}
                        {...inputProps}
                        placeholder=" "
                        aria-label={ariaLabels.ariaLabel}
                        aria-labelledby={ariaLabels.ariaLabelledBy}
                        aria-describedby={selector.validation ? errorId : undefined}
                        aria-invalid={selector.validation ? true : undefined}
                        aria-busy={selector.options.isLoading || undefined}
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
                floatingRef={refs.setFloating}
                floatingStyles={floatingStyles}
            />
        </Fragment>
    );
}
