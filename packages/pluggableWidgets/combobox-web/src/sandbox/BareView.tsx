import { CSSProperties, FocusEvent, KeyboardEvent, ReactElement, useEffect, useRef } from "react";
import { ComboboxOptionVM, ComboboxViewModel } from "../core/ComboboxViewModel";

const visuallyHidden: CSSProperties = {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap"
};

function crossesBoundary(e: FocusEvent): boolean {
    return !e.currentTarget.contains(e.relatedTarget as Node | null);
}

/**
 * A throwaway second View over the ViewModel alone: plain markup, its own keyboard handling and
 * ARIA, no Behavior, no Popover, no classes. It exists to prove that the ViewModel carries what a
 * View built on a component library needs. See README.md in this folder.
 */
export function BareView({ vm }: { vm: ComboboxViewModel }): ReactElement {
    const multi = vm.mode === "multi";
    const inputRef = useRef<HTMLInputElement>(null);
    const selectAllRef = useRef<HTMLInputElement>(null);
    const listboxId = `${vm.id}-bare-listbox`;
    const optionId = (index: number): string => `${vm.id}-bare-option-${index}`;
    const hasValue = multi ? vm.chips.length > 0 : vm.value !== null;
    const activeOption =
        vm.highlightedIndex >= 0 && vm.highlightedIndex < vm.options.length ? optionId(vm.highlightedIndex) : undefined;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = vm.allSelected === "some";
        }
    }, [vm.allSelected]);

    const openMenu = (highlight: number): void => {
        vm.open();
        vm.highlight(highlight);
    };

    const choose = (option: ComboboxOptionVM): void => {
        if (multi) {
            vm.toggleItem(option.id);
            vm.setInputValue("", "reset");
        } else {
            vm.select(option.id);
            vm.close();
        }
    };

    const move = (step: 1 | -1): void => {
        const count = vm.options.length;
        if (count === 0) {
            return;
        }
        const from = vm.highlightedIndex < 0 ? (step > 0 ? -1 : count) : vm.highlightedIndex;
        vm.highlight((from + step + count) % count);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (vm.isOpen) {
                    move(1);
                } else {
                    openMenu(0);
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (vm.isOpen) {
                    move(-1);
                } else {
                    openMenu(vm.options.length - 1);
                }
                break;
            case "Enter":
                if (vm.isOpen && activeOption) {
                    e.preventDefault();
                    choose(vm.options[vm.highlightedIndex]);
                }
                break;
            case " ":
                if (multi && vm.isOpen && activeOption && vm.inputValue === "") {
                    e.preventDefault();
                    vm.toggleItem(vm.options[vm.highlightedIndex].id);
                }
                break;
            case "Escape":
                if (vm.isOpen) {
                    vm.close();
                    vm.setInputValue("", "reset");
                }
                break;
            case "Backspace":
                if (!multi && vm.clearable && vm.inputValue === "" && hasValue) {
                    vm.clear();
                }
                break;
            case "Tab":
                if (vm.isOpen) {
                    vm.close();
                }
                break;
            default:
                break;
        }
    };

    return (
        <div
            className={vm.className}
            style={vm.style}
            onFocus={e => {
                if (crossesBoundary(e)) {
                    vm.enter();
                }
            }}
            onBlur={e => {
                if (crossesBoundary(e)) {
                    vm.leave();
                }
            }}
        >
            {multi &&
                vm.chips.map(chip => (
                    <span key={chip.id}>
                        {chip.content ?? chip.caption}
                        {!vm.readOnly && (
                            <button
                                type="button"
                                tabIndex={-1}
                                aria-label={vm.t("removeSelection")}
                                onClick={() => vm.deselect(chip.id)}
                            >
                                ×
                            </button>
                        )}
                    </span>
                ))}
            <input
                ref={inputRef}
                id={vm.id}
                role="combobox"
                value={vm.inputValue}
                disabled={vm.readOnly}
                readOnly={!vm.filterable}
                tabIndex={vm.tabIndex}
                aria-expanded={vm.isOpen}
                aria-haspopup="listbox"
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={vm.isOpen ? activeOption : undefined}
                aria-invalid={vm.validation ? true : undefined}
                aria-describedby={vm.a11y.describedBy}
                aria-required={vm.a11y.required || undefined}
                aria-label={vm.a11y.label}
                onChange={e => {
                    vm.setInputValue(e.target.value);
                    if (!vm.isOpen) {
                        vm.open();
                    }
                }}
                onKeyDown={onKeyDown}
                onClick={() => {
                    if (vm.isOpen) {
                        vm.close();
                    } else {
                        openMenu(multi ? -1 : 0);
                    }
                }}
            />
            {!multi && vm.inputValue === "" && <span aria-hidden="true">{vm.selectedCaption}</span>}
            {vm.clearable && !vm.readOnly && hasValue && (
                <button
                    type="button"
                    aria-label={vm.t("clearSelection")}
                    onClick={() => {
                        vm.clear();
                        inputRef.current?.focus();
                    }}
                >
                    ×
                </button>
            )}
            {vm.validation && (
                <div id={vm.a11y.describedBy} role="alert">
                    {vm.validation}
                </div>
            )}
            <div role="status" aria-live="polite" style={visuallyHidden}>
                {vm.a11y.statusMessage}
            </div>
            {vm.isOpen && (
                <div onMouseDown={e => e.preventDefault()}>
                    {multi && vm.canSelectAll && (
                        <label>
                            <input
                                ref={selectAllRef}
                                type="checkbox"
                                checked={vm.allSelected === "all"}
                                onChange={() => (vm.allSelected === "all" ? vm.clear() : vm.selectAll())}
                            />
                            {vm.t("selectAll")}
                        </label>
                    )}
                    <ul
                        id={listboxId}
                        role="listbox"
                        aria-multiselectable={multi || undefined}
                        onScroll={e => {
                            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                            if (vm.loading.lazy && vm.loading.hasMore && scrollHeight - scrollTop - clientHeight < 1) {
                                vm.loadMore();
                            }
                        }}
                    >
                        {vm.options.length === 0 && !vm.loading.isLoading && (
                            <li role="option" aria-selected={false} aria-disabled="true">
                                {vm.t("noOptions")}
                            </li>
                        )}
                        {vm.options.map((option, index) => (
                            <li
                                key={option.id}
                                id={optionId(index)}
                                role="option"
                                aria-selected={option.selected}
                                style={{ background: option.highlighted ? "#eee" : undefined }}
                                onMouseMove={() => {
                                    if (!option.highlighted) {
                                        vm.highlight(index);
                                    }
                                }}
                                onClick={() => choose(option)}
                            >
                                {option.content ?? option.caption}
                            </li>
                        ))}
                        {vm.loading.isLoading && <li aria-busy="true">…</li>}
                    </ul>
                    {vm.slots.menuFooter}
                </div>
            )}
        </div>
    );
}
