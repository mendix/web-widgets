import classNames from "classnames";
import { Fragment, KeyboardEventHandler, ReactElement, useMemo, useRef } from "react";
import { ClearButton } from "../../assets/icons";
import { SingleSelector } from "../../helpers/types";
import { getInputLabel, getValidationErrorId } from "../../helpers/utils";
import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { useFloatingMenu } from "../../hooks/useFloatingMenu";
import { useLazyLoading } from "../../hooks/useLazyLoading";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { SelectionProps } from "../SelectionProps";
import { SingleSelectionMenu } from "./SingleSelectionMenu";

export function SingleSelection({ core, vm, keepMenuOpen }: SelectionProps<SingleSelector>): ReactElement {
    // Behaviour hooks still read the selector through the core; the markup reads the ViewModel only.
    const { selector } = core;
    const inputId = vm.id;
    const tabIndex = vm.tabIndex ?? 0;
    const {
        getInputProps,
        getToggleButtonProps,
        getItemProps,
        getMenuProps,
        reset,
        isOpen,
        highlightedIndex,
        selectItem
    } = useDownshiftSingleSelectProps(core, { inputId, labelId: `${inputId}-label` });
    const inputRef = useRef<HTMLInputElement>(null);
    const { refs, floatingStyles } = useFloatingMenu(keepMenuOpen === true ? false : isOpen);
    const { onScroll } = useLazyLoading({
        hasMoreItems: vm.loading.hasMore,
        isInfinite: vm.loading.lazy,
        isOpen,
        loadMore: vm.loadMore,
        datasourceFilter: selector.options.datasourceFilter,
        readOnly: vm.readOnly
    });

    const inputLabel = getInputLabel(inputId);
    const errorId = getValidationErrorId(inputId);
    const hasLabel = useMemo(() => Boolean(inputLabel), [inputLabel]);
    const onInputKeyDown = useMemo<KeyboardEventHandler<HTMLInputElement> | undefined>(() => {
        if (!vm.clearable) {
            return undefined;
        }

        return e => {
            if (e.key === "Backspace" && e.currentTarget.value === "") {
                selectItem(null);
            }
        };
    }, [vm.clearable, selectItem]);

    const inputProps = getInputProps(
        {
            disabled: vm.readOnly,
            readOnly: !vm.filterable,
            ref: inputRef,
            "aria-required": vm.a11y.required,
            "aria-label": !hasLabel && vm.a11y.label ? vm.a11y.label : undefined,
            onKeyDown: onInputKeyDown
        },
        { suppressRefError: true }
    );
    const customContentEverywhere = vm.hints.customContent === "everywhere";
    return (
        <Fragment>
            <ComboboxWrapper
                ref={refs.setReference}
                isOpen={isOpen || keepMenuOpen === true}
                readOnly={vm.readOnly}
                readOnlyStyle={vm.hints.readOnlyStyle}
                getToggleButtonProps={getToggleButtonProps}
                validation={vm.validation}
                isLoading={vm.loading.lazy && vm.loading.isLoading}
                errorId={errorId}
            >
                <div
                    className={classNames("widget-combobox-selected-items", {
                        "widget-combobox-custom-content": customContentEverywhere
                    })}
                >
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": !vm.filterable || vm.readOnly
                        })}
                        tabIndex={tabIndex}
                        {...inputProps}
                        placeholder=" "
                        aria-labelledby={hasLabel ? inputProps["aria-labelledby"] : undefined}
                        aria-describedby={vm.a11y.describedBy}
                        aria-invalid={vm.validation ? true : undefined}
                    />
                    <InputPlaceholder isEmpty={!vm.value} type={customContentEverywhere ? "custom" : "text"}>
                        {vm.selectedContent}
                    </InputPlaceholder>
                </div>
                {!vm.readOnly && vm.clearable && vm.value !== null && (
                    <button
                        tabIndex={tabIndex}
                        className="widget-combobox-clear-button"
                        aria-label={vm.t("clearSelection")}
                        onClick={e => {
                            e.stopPropagation();
                            inputRef.current?.focus();
                            vm.clear();
                            reset();
                        }}
                    >
                        <ClearButton />
                    </button>
                )}
            </ComboboxWrapper>
            <SingleSelectionMenu
                vm={vm}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
                isOpen={isOpen || keepMenuOpen === true}
                highlightedIndex={highlightedIndex}
                alwaysOpen={keepMenuOpen}
                onScroll={onScroll}
                floatingRef={refs.setFloating}
                floatingStyles={floatingStyles}
            />
        </Fragment>
    );
}
