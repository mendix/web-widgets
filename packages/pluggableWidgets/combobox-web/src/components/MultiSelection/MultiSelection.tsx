import classNames from "classnames";
import { Fragment, KeyboardEvent, ReactElement, useEffect, useMemo, useRef } from "react";
import { ClearButton } from "../../assets/icons";
import { MultiSelector, SelectionBaseProps } from "../../helpers/types";
import { getInputLabel, getSelectedCaptionsPlaceholder, getValidationErrorId } from "../../helpers/utils";
import { useDownshiftMultiSelectProps } from "../../hooks/useDownshiftMultiSelectProps";
import { useFloatingMenu } from "../../hooks/useFloatingMenu";
import { useLazyLoading } from "../../hooks/useLazyLoading";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { MultiSelectionMenu } from "./MultiSelectionMenu";
import { SelectAllButton } from "./SelectAllButton";

/**
 * Whether a key press in the filter input may be redirected to the selected items (chips)
 * instead of being handled as text editing.
 *
 * Mirrors downshift's own `isKeyDownOperationPermitted` (downshift 7.6.2,
 * dist/downshift.cjs.js), which gates its dropdown key handlers but is not exported.
 * Keeping the same rule here stops the widget and the library from disagreeing about
 * whether a key belongs to the text field or to the chip list.
 *
 * Re-check this against downshift's implementation when upgrading downshift.
 */
function isChipNavigationPermitted(event: KeyboardEvent): boolean {
    if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
        return false;
    }

    const element = event.target;

    // Text still present and the caret is either not at the start or is highlighting a
    // range (e.g. after select-all) -> the key belongs to the text field.
    return !(
        element instanceof HTMLInputElement &&
        element.value !== "" &&
        (element.selectionStart !== 0 || element.selectionEnd !== 0)
    );
}

export function MultiSelection({
    selector,
    tabIndex,
    a11yConfig,
    menuFooterContent,
    ariaRequired,
    ...options
}: SelectionBaseProps<MultiSelector>): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    /** Chip DOM nodes by index, so focus can be restored after a chip is removed. */
    const chipRefs = useRef<Array<HTMLElement | null>>([]);
    /** Index of the chip a Backspace/Delete press is about to remove, or null. */
    const chipToRefocusRef = useRef<number | null>(null);
    const {
        isOpen,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        items,
        setSelectedItems,
        toggleSelectedItem
    } = useDownshiftMultiSelectProps(selector, options, inputRef, a11yConfig.a11yStatusMessage);
    // Guard keepMenuOpen so floating-ui (and its autoUpdate scroll/resize listeners) stay disabled
    // in always-open mode, matching SingleSelection. keepMenuOpen is only set by the editor preview,
    // which renders SingleSelection exclusively, so MultiSelection never receives it at runtime or in
    // preview; this is a defensive guard. The inline always-open branch (alwaysOpen on the menu wrapper)
    // is intentionally not threaded through MultiSelectionMenu because it is unreachable for multi-select.
    const keepMenuOpen = options.keepMenuOpen;
    const { refs, floatingStyles } = useFloatingMenu(keepMenuOpen === true ? false : isOpen);
    const isSelectedItemsBoxStyle = selector.selectedItemsStyle === "boxes";
    const isOptionsSelected = selector.isOptionsSelected();
    const inputLabel = getInputLabel(options.inputId);
    const errorId = getValidationErrorId(options.inputId);
    const hasLabel = useMemo(() => Boolean(inputLabel), [inputLabel]);
    const inputProps = getInputProps({
        ...getDropdownProps(
            {
                preventKeyAction: isOpen
            },
            { suppressRefError: true }
        ),
        ref: inputRef,
        onKeyDown: (event: KeyboardEvent) => {
            if (
                isChipNavigationPermitted(event) &&
                (event.key === "Backspace" || (event.key === "ArrowLeft" && isSelectedItemsBoxStyle))
            ) {
                setActiveIndex(selectedItems.length - 1);
            }
            if (event.key === " ") {
                if (highlightedIndex >= 0) {
                    toggleSelectedItem(highlightedIndex);
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        },
        disabled: selector.readOnly,
        readOnly: selector.options.filterType === "none",
        "aria-required": ariaRequired.value,
        "aria-label": !hasLabel && options.ariaLabel ? options.ariaLabel : undefined
    });

    /**
     * Keeps keyboard focus on the selected items when one of them is removed with
     * Backspace/Delete.
     *
     * downshift removes the chip but only moves DOM focus when its own `activeIndex`
     * changes: its `SelectedItemKeyDownBackspace`/`SelectedItemKeyDownDelete` reducer
     * (downshift 7.6.2, dist/downshift.cjs.js) keeps `activeIndex` unchanged for every chip
     * except the last one, while its focus effect depends on `[activeIndex]`. So removing a
     * chip from anywhere but the end unmounts the focused element without focusing anything
     * else, and focus falls back to the document body.
     *
     * `Math.min(index, count - 1)` reproduces downshift's new `activeIndex` for every
     * position, so this focuses the element downshift also marks as active (tabIndex 0).
     *
     * Re-check this against downshift's implementation when upgrading downshift.
     */
    useEffect(() => {
        const removedIndex = chipToRefocusRef.current;
        if (removedIndex === null) {
            return;
        }
        chipToRefocusRef.current = null;
        const indexToFocus = Math.min(removedIndex, selectedItems.length - 1);
        if (indexToFocus < 0) {
            inputRef.current?.focus();
            return;
        }
        chipRefs.current[indexToFocus]?.focus();
        // Keyed on the number of chips so this runs on the render that actually removes the
        // chip: `selectedItems` can be a new array on any render, and running earlier would
        // focus the node that is about to unmount.
    }, [selectedItems.length]);

    const memoizedselectedCaptions = useMemo(
        () => getSelectedCaptionsPlaceholder(selector, selectedItems),
        [selector, selectedItems]
    );

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
        readOnly: selector.readOnly
    });

    return (
        <Fragment>
            <ComboboxWrapper
                ref={refs.setReference}
                isOpen={isOpen}
                readOnly={selector.readOnly}
                readOnlyStyle={options.readOnlyStyle}
                getToggleButtonProps={getToggleButtonProps}
                validation={selector.validation}
                isLoading={lazyLoading && selector.options.isLoading}
                isMultiselectActive={selectedItems?.length > 0}
                errorId={errorId}
            >
                <div
                    className={classNames(
                        "widget-combobox-selected-items",
                        `widget-combobox-${selector.selectedItemsStyle}`
                    )}
                >
                    {isSelectedItemsBoxStyle &&
                        selectedItems.map((selectedItemForRender, index) => {
                            return (
                                <div
                                    className="widget-combobox-selected-item"
                                    key={selectedItemForRender}
                                    {...getSelectedItemProps({
                                        selectedItem: selectedItemForRender,
                                        index,
                                        ref: (node: HTMLElement | null) => {
                                            chipRefs.current[index] = node;
                                        },
                                        onKeyDown: (event: KeyboardEvent) => {
                                            // downshift removes the chip after this handler runs; remember
                                            // which slot keyboard focus must return to once that renders.
                                            if (event.key === "Backspace" || event.key === "Delete") {
                                                chipToRefocusRef.current = index;
                                            }
                                        }
                                    })}
                                >
                                    {selector.caption.render(selectedItemForRender, "label")}
                                    {!selector.readOnly && (
                                        <span
                                            className="icon widget-combobox-clear-button"
                                            aria-label={a11yConfig.ariaLabels?.removeSelection}
                                            role="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                removeSelectedItem(selectedItemForRender);
                                            }}
                                        >
                                            <ClearButton size={10} />
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": selector.options.filterType === "none"
                        })}
                        tabIndex={tabIndex}
                        placeholder=" "
                        {...inputProps}
                        aria-labelledby={hasLabel ? inputProps["aria-labelledby"] : undefined}
                        aria-describedby={selector.validation ? errorId : undefined}
                        aria-invalid={selector.validation ? true : undefined}
                    />
                    <InputPlaceholder isEmpty={selectedItems.length <= 0}>{memoizedselectedCaptions}</InputPlaceholder>
                </div>

                {!selector.readOnly &&
                    selector.clearable &&
                    selector.currentId !== null &&
                    selector.currentId.length > 0 && (
                        <button
                            tabIndex={tabIndex}
                            className="widget-combobox-clear-button"
                            aria-label={a11yConfig.ariaLabels?.clearSelection}
                            onClick={e => {
                                e.stopPropagation();
                                inputRef.current?.focus();
                                if (selectedItems.length > 0) {
                                    setSelectedItems([]);
                                }
                            }}
                        >
                            <ClearButton />
                        </button>
                    )}
            </ComboboxWrapper>
            <MultiSelectionMenu
                menuHeaderContent={
                    selector.selectAllButton ? (
                        <SelectAllButton
                            disabled={items.length === 0}
                            value={isOptionsSelected}
                            id={`${options.inputId}-select-all-button`}
                            ariaLabel={a11yConfig.ariaLabels.selectAll}
                            onChange={() => {
                                if (isOptionsSelected === "all") {
                                    setSelectedItems([]);
                                } else {
                                    setSelectedItems(selector.options.getAll());
                                }
                            }}
                        />
                    ) : undefined
                }
                menuFooterContent={menuFooterContent}
                inputId={options.inputId}
                selector={selector}
                isOpen={isOpen}
                highlightedIndex={highlightedIndex}
                selectableItems={items}
                getItemProps={getItemProps}
                getMenuProps={getMenuProps}
                selectedItems={selectedItems}
                noOptionsText={options.noOptionsText}
                onOptionClick={() => {
                    inputRef.current?.focus();
                }}
                isLoading={selector.options.isLoading}
                lazyLoading={lazyLoading}
                onScroll={onScroll}
                floatingRef={refs.setFloating}
                floatingStyles={floatingStyles}
            />
        </Fragment>
    );
}
