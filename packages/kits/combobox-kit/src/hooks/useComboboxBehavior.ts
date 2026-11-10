import {
    useCombobox,
    UseComboboxState,
    UseComboboxStateChange,
    UseComboboxStateChangeOptions,
    useMultipleSelection
} from "downshift";
import {
    FocusEvent,
    HTMLAttributes,
    InputHTMLAttributes,
    KeyboardEvent,
    MouseEvent,
    Ref,
    useCallback,
    useEffect,
    useMemo,
    useRef
} from "react";
import { focusBoundaryProps } from "@mendix/widget-kit/focusBoundaryProps";
import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import { ComboboxViewModel } from "../core/ComboboxViewModel";
import { getInputLabel } from "../helpers/utils";

/**
 * DOM attributes and handlers for the interactive parts of a combobox View. Every getter is a
 * function of the ViewModel; the View spreads the result on whichever element plays that part.
 * See docs/design/headless-combobox.md, section 4.
 */
export interface ComboboxBehavior {
    /** Enter and leave detection on the outermost element, through `relatedTarget`. */
    getRootProps(): { onFocus(e: FocusEvent): void; onBlur(e: FocusEvent): void };
    /** `data-readonly` while the input takes no typing: filtering is off or the widget is read-only. */
    getInputProps(): InputHTMLAttributes<HTMLInputElement> & { ref: Ref<HTMLInputElement>; "data-readonly"?: true };
    /** Props for the element that toggles the menu; downshift also returns its ARIA attributes. */
    getToggleProps(): { id?: string; onClick?(e: MouseEvent): void; "data-open"?: true } & Record<string, unknown>;
    /** `data-lazy` while the list loads more on scroll, `data-highlighted` while an option is highlighted. */
    getMenuProps(): HTMLAttributes<HTMLUListElement> & {
        "data-lazy"?: true;
        "data-highlighted"?: true;
    } & Record<string, unknown>;
    getOptionProps(index: number): HTMLAttributes<HTMLLIElement> & {
        "data-selected"?: true;
        "data-highlighted"?: true;
    } & Record<string, unknown>;
    /** `data-active` on the chip that has keyboard focus. */
    getChipProps(index: number): HTMLAttributes<HTMLDivElement> & { ref: Ref<HTMLDivElement>; "data-active"?: true };
    getChipRemoveProps(index: number): { role: "button"; "aria-label": string; onClick(e: MouseEvent): void };
    getClearProps(): { tabIndex?: number; "aria-label": string; onClick(e: MouseEvent): void };
    getSelectAllProps(): {
        id: string;
        "aria-label": string;
        checked: "all" | "some" | "none";
        disabled: boolean;
        onChange(): void;
    };
}

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

function stopPropagation(e: MouseEvent): void {
    e.stopPropagation();
}

/** A state attribute is present (`data-x="true"`) or absent, never `"false"`. */
function flag(on: boolean): true | undefined {
    return on || undefined;
}

/** The menu list must not take focus from the input, and a click inside must not close it. */
function preventMenuClose(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Keyboard handling and ARIA for the Atlas View, built on downshift in fully controlled mode:
 * the Core is the source of truth for the open flag, the input text, the highlight and the
 * selection, and downshift reduces DOM events into Core commands. The key handling and the
 * accumulated fixes of the former downshift hooks survive here unchanged.
 */
export function useComboboxBehavior(vm: ComboboxViewModel): ComboboxBehavior {
    const multi = vm.mode === "multi";
    const inputRef = useRef<HTMLInputElement>(null);
    /** Chip DOM nodes by index, so focus can be restored after a chip is removed. */
    const chipNodesRef = useRef<Array<HTMLDivElement | null>>([]);
    /** Index of the chip a Backspace/Delete press is about to remove, or null. */
    const chipToRefocusRef = useRef<number | null>(null);

    const ids = useMemo(() => vm.options.map(option => option.id), [vm.options]);
    const captions = useMemo(() => {
        const map = new Map<string, string>();
        for (const option of [...vm.options, ...vm.chips, ...(vm.selected ? [vm.selected] : [])]) {
            map.set(option.id, option.caption);
        }
        return map;
    }, [vm.options, vm.chips, vm.selected]);
    const { t, setInputValue, toggleItem, select, deselect, clear, selectAll, open, close, highlight, enter, leave } =
        vm;
    const { placeholder } = vm;
    const captionOf = useCallback(
        (id: string | null): string => (id === null ? placeholder : (captions.get(id) ?? "")),
        [captions, placeholder]
    );
    const selectedIds = useMemo<string[]>(
        () => (multi && Array.isArray(vm.value) ? [...vm.value] : []),
        [multi, vm.value]
    );

    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        setSelectedItems,
        activeIndex
    } = useMultipleSelection<string>({
        selectedItems: selectedIds,
        itemToString: captionOf,
        getA11yRemovalMessage(options) {
            return `${options.itemToString(options.removedSelectedItem)} has been removed.`;
        },
        onSelectedItemsChange({ selectedItems: next = [] }) {
            for (const id of selectedIds) {
                if (!next.includes(id)) {
                    deselect(id);
                }
            }
            for (const id of next) {
                if (!selectedIds.includes(id)) {
                    select(id);
                }
            }
        },
        onStateChange({ selectedItems: next, type, activeIndex }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                    if (activeIndex === -1) {
                        inputRef.current?.focus();
                    }
                    setSelectedItems(next!);
                    break;
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    setSelectedItems(next!);
                    break;
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownNavigationNext:
                    if (activeIndex === -1) {
                        inputRef.current?.focus();
                    }
                    break;
                default:
                    break;
            }
        }
    });

    const stateReducer = useCallback(
        (
            state: UseComboboxState<string>,
            { changes, type }: UseComboboxStateChangeOptions<string>
        ): Partial<UseComboboxState<string>> => {
            if (multi) {
                switch (type) {
                    case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                        return { ...changes, inputValue: state.inputValue };
                    case useCombobox.stateChangeTypes.InputFocus:
                        return { ...changes, isOpen: state.isOpen };
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                        return {
                            ...changes,
                            ...(changes.selectedItem && {
                                isOpen: true,
                                inputValue: "",
                                highlightedIndex: ids.indexOf(changes.selectedItem)
                            })
                        };
                    case useCombobox.stateChangeTypes.InputKeyDownEscape:
                    case useCombobox.stateChangeTypes.FunctionCloseMenu:
                        return {
                            ...changes,
                            ...(changes.selectedItem && {
                                isOpen: false,
                                inputValue: "",
                                highlightedIndex: ids.indexOf(changes.selectedItem)
                            })
                        };
                    case useCombobox.stateChangeTypes.InputBlur:
                        return { ...state, highlightedIndex: -1 };
                    default:
                        return changes;
                }
            }
            switch (type) {
                // clear input when user toggles (closes) dropdown; when item is selected, downshift
                // fills in input automatically, prevent that.
                case useCombobox.stateChangeTypes.ToggleButtonClick:
                case useCombobox.stateChangeTypes.FunctionSelectItem:
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    return { ...changes, inputValue: "" };
                case useCombobox.stateChangeTypes.InputFocus:
                    return {
                        ...changes,
                        isOpen: state.isOpen,
                        inputValue: "",
                        highlightedIndex: changes.selectedItem ? -1 : 0
                    };
                // clear input when user want to close the popup with escape (or it was closed programmatically)
                case useCombobox.stateChangeTypes.InputKeyDownEscape:
                case useCombobox.stateChangeTypes.FunctionCloseMenu:
                    return { ...changes, selectedItem: state.selectedItem, isOpen: false, inputValue: "" };
                case useCombobox.stateChangeTypes.InputBlur:
                    return state;
                default:
                    return { ...changes };
            }
        },
        [multi, ids]
    );

    const { getInputProps, getToggleButtonProps, getMenuProps, getItemProps, selectItem, reset } = useCombobox<string>({
        items: ids,
        itemToString: captionOf,
        inputId: vm.id,
        labelId: `${vm.id}-label`,
        isOpen: vm.isOpen,
        inputValue: vm.inputValue,
        highlightedIndex: vm.highlightedIndex,
        selectedItem: multi ? null : (vm.value as string | null),
        // A single-select menu opens on its first option; a multi-select opens with no highlight.
        defaultHighlightedIndex: multi ? undefined : 0,
        stateReducer,
        // The live-region text of the released widget, word for word: the multi-mode message
        // depends on downshift's previous result count and highlighted item.
        getA11yStatusMessage(options) {
            if (multi) {
                let message =
                    selectedIds.length > 0 ? `${t("a11ySelectedValue", selectedIds.map(captionOf).join(","))}. ` : "";
                if (!options.resultCount) {
                    return t("a11yNoOption");
                }
                if (!options.isOpen) {
                    return message;
                }
                if (options.previousResultCount !== options.resultCount || !options.highlightedItem) {
                    message += `${t("a11yOptionsAvailable", options.resultCount)}. ${t("a11yInstructions")}`;
                }
                return message;
            }
            const current = vm.value as string | null;
            const selectedItem = captionOf(current);
            let message = selectedItem
                ? current
                    ? `${t("a11ySelectedValue", selectedItem)}. `
                    : "No options selected."
                : "";
            if (!options.isOpen) {
                return message;
            }
            if (!options.resultCount) {
                return t("a11yNoOption");
            }
            message += `${t("a11yOptionsAvailable", options.resultCount)}. ${t("a11yInstructions")}`;
            return message;
        },
        onIsOpenChange({ isOpen }) {
            if (isOpen) {
                open();
            } else {
                close();
            }
        },
        onHighlightedIndexChange({ highlightedIndex }) {
            highlight(highlightedIndex ?? -1);
        },
        onInputValueChange({ inputValue, type }: UseComboboxStateChange<string>) {
            setInputValue(inputValue ?? "", type === useCombobox.stateChangeTypes.InputChange ? "input" : "reset");
        },
        onSelectedItemChange({ selectedItem }) {
            if (multi) {
                return;
            }
            if (selectedItem) {
                select(selectedItem);
            } else {
                clear();
            }
        },
        onStateChange({ type, selectedItem }) {
            if (!multi) {
                return;
            }
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    if (selectedItem) {
                        toggleItem(selectedItem);
                    }
                    break;
                default:
                    break;
            }
        }
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
        chipNodesRef.current[indexToFocus]?.focus();
        // Keyed on the number of chips so this runs on the render that actually removes the
        // chip: `selectedItems` can be a new array on any render, and running earlier would
        // focus the node that is about to unmount.
    }, [selectedItems.length]);

    const { loadMore } = vm;
    const setPage = useCallback(() => loadMore(), [loadMore]);
    const [trackScrolling] = useInfiniteControl({
        hasMoreItems: vm.loading.hasMore,
        isInfinite: vm.loading.lazy,
        setPage
    });

    const rootProps = useMemo(() => focusBoundaryProps({ enter, leave }), [enter, leave]);

    const hasLabel = Boolean(getInputLabel(vm.id));
    const chipsStyle = vm.hints.selectedItemsStyle === "boxes";

    return {
        getRootProps: () => rootProps,
        getInputProps: () => {
            const ariaProps = {
                "aria-required": vm.a11y.required,
                "aria-label": !hasLabel && vm.a11y.label ? vm.a11y.label : undefined
            };
            const inputProps = multi
                ? getInputProps({
                      ...getDropdownProps({ preventKeyAction: vm.isOpen }, { suppressRefError: true }),
                      ref: inputRef,
                      onKeyDown: (event: KeyboardEvent) => {
                          if (
                              isChipNavigationPermitted(event) &&
                              (event.key === "Backspace" || (event.key === "ArrowLeft" && chipsStyle))
                          ) {
                              setActiveIndex(selectedItems.length - 1);
                          }
                          if (event.key === " ") {
                              if (vm.highlightedIndex >= 0) {
                                  const id = ids[vm.highlightedIndex];
                                  if (id) {
                                      toggleItem(id);
                                      setInputValue("", "reset");
                                  }
                                  event.preventDefault();
                                  event.stopPropagation();
                              }
                          }
                      },
                      disabled: vm.readOnly,
                      readOnly: !vm.filterable,
                      ...ariaProps
                  })
                : getInputProps(
                      {
                          // No chips to navigate in single mode, but downshift's dev-mode checker
                          // expects every getter of a hook in use to be called.
                          ...getDropdownProps({ preventKeyAction: true }, { suppressRefError: true }),
                          disabled: vm.readOnly,
                          readOnly: !vm.filterable,
                          ref: inputRef,
                          ...ariaProps,
                          onKeyDown: vm.clearable
                              ? (e: KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Backspace" && e.currentTarget.value === "") {
                                        selectItem(null);
                                    }
                                }
                              : undefined
                      },
                      { suppressRefError: true }
                  );
            return {
                tabIndex: multi ? vm.tabIndex : (vm.tabIndex ?? 0),
                placeholder: " ",
                ...inputProps,
                "aria-labelledby": hasLabel ? inputProps["aria-labelledby"] : undefined,
                "aria-describedby": vm.a11y.describedBy,
                "aria-invalid": vm.validation ? true : undefined,
                "data-readonly": flag(!vm.filterable || vm.readOnly)
            };
        },
        getToggleProps: () => ({ ...getToggleButtonProps(), "data-open": flag(vm.isOpen) }),
        getMenuProps: () => ({
            ...getMenuProps(
                {
                    onClick: multi ? () => inputRef.current?.focus() : undefined,
                    onMouseDown: preventMenuClose,
                    onScroll: vm.loading.lazy ? trackScrolling : undefined
                },
                { suppressRefError: true }
            ),
            "aria-multiselectable": multi || undefined,
            "data-lazy": flag(vm.loading.lazy && vm.options.length > 0),
            "data-highlighted": flag(vm.highlightedIndex >= 0)
        }),
        getOptionProps: index => {
            const option = vm.options[index];
            return {
                ...getItemProps({ index, item: option.id }),
                "aria-selected": option.selected,
                "data-selected": flag(option.selected),
                "data-highlighted": flag(option.highlighted)
            };
        },
        getChipProps: index => ({
            ...getSelectedItemProps({
                selectedItem: vm.chips[index].id,
                index,
                ref: (node: HTMLDivElement | null) => {
                    chipNodesRef.current[index] = node;
                },
                onKeyDown: (event: KeyboardEvent) => {
                    // downshift removes the chip after this handler runs; remember
                    // which slot keyboard focus must return to once that renders.
                    if (event.key === "Backspace" || event.key === "Delete") {
                        chipToRefocusRef.current = index;
                    }
                }
            }),
            "data-active": flag(activeIndex === index)
        }),
        getChipRemoveProps: index => ({
            role: "button",
            "aria-label": t("removeSelection"),
            onClick: e => {
                stopPropagation(e);
                removeSelectedItem(vm.chips[index].id);
            }
        }),
        getClearProps: () => ({
            tabIndex: multi ? vm.tabIndex : (vm.tabIndex ?? 0),
            "aria-label": t("clearSelection"),
            onClick: e => {
                stopPropagation(e);
                inputRef.current?.focus();
                if (multi) {
                    if (vm.chips.length > 0) {
                        clear();
                    }
                } else {
                    clear();
                    reset();
                }
            }
        }),
        getSelectAllProps: () => ({
            id: `${vm.id}-select-all-button`,
            "aria-label": t("selectAll"),
            checked: vm.allSelected,
            disabled: vm.options.length === 0,
            onChange: () => {
                if (vm.allSelected === "all") {
                    clear();
                } else {
                    selectAll();
                }
            }
        })
    };
}
