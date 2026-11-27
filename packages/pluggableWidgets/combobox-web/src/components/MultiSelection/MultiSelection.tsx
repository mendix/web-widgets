import classNames from "classnames";
import { ReactElement } from "react";
import { ClearButton } from "../../assets/icons";
import { getValidationErrorId } from "../../helpers/utils";
import { useComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxPopover } from "../../hooks/useComboboxPopover";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { SelectionProps } from "../SelectionProps";
import { MultiSelectionMenu } from "./MultiSelectionMenu";
import { SelectAllButton } from "./SelectAllButton";

export function MultiSelection({ vm, keepMenuOpen, className }: SelectionProps): ReactElement {
    const behavior = useComboboxBehavior(vm);
    // Guard keepMenuOpen so floating-ui (and its autoUpdate scroll/resize listeners) stay disabled
    // in always-open mode, matching SingleSelection. keepMenuOpen is only set by the editor preview,
    // which renders SingleSelection exclusively, so MultiSelection never receives it at runtime or in
    // preview; this is a defensive guard. The inline always-open branch (alwaysOpen on the menu wrapper)
    // is intentionally not threaded through MultiSelectionMenu because it is unreachable for multi-select.
    const popover = useComboboxPopover(vm, { alwaysOpen: keepMenuOpen });
    const isSelectedItemsBoxStyle = vm.hints.selectedItemsStyle === "boxes";
    const selectAllProps = vm.canSelectAll ? behavior.getSelectAllProps() : undefined;

    return (
        <div className={classNames("widget-combobox", className)} {...behavior.getRootProps()}>
            <ComboboxWrapper
                ref={popover.setReference}
                isOpen={vm.isOpen}
                readOnly={vm.readOnly}
                readOnlyStyle={vm.hints.readOnlyStyle}
                toggleProps={behavior.getToggleProps()}
                validation={vm.validation}
                isLoading={vm.loading.lazy && vm.loading.isLoading}
                isMultiselectActive={vm.chips.length > 0}
                errorId={getValidationErrorId(vm.id)}
            >
                <div
                    className={classNames(
                        "widget-combobox-selected-items",
                        `widget-combobox-${vm.hints.selectedItemsStyle}`
                    )}
                >
                    {isSelectedItemsBoxStyle &&
                        vm.chips.map((chip, index) => (
                            <div
                                className="widget-combobox-selected-item"
                                key={chip.id}
                                {...behavior.getChipProps(index)}
                            >
                                {chip.content}
                                {!vm.readOnly && (
                                    <span
                                        className="icon widget-combobox-clear-button"
                                        {...behavior.getChipRemoveProps(index)}
                                    >
                                        <ClearButton size={10} />
                                    </span>
                                )}
                            </div>
                        ))}
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": !vm.filterable
                        })}
                        {...behavior.getInputProps()}
                    />
                    <InputPlaceholder isEmpty={vm.chips.length <= 0}>{vm.selectedContent}</InputPlaceholder>
                </div>

                {!vm.readOnly && vm.clearable && vm.value !== null && vm.value.length > 0 && (
                    <button className="widget-combobox-clear-button" {...behavior.getClearProps()}>
                        <ClearButton />
                    </button>
                )}
            </ComboboxWrapper>
            <MultiSelectionMenu
                menuHeaderContent={
                    selectAllProps ? (
                        <SelectAllButton
                            disabled={selectAllProps.disabled}
                            value={selectAllProps.checked}
                            id={selectAllProps.id}
                            ariaLabel={selectAllProps["aria-label"]}
                            onChange={selectAllProps.onChange}
                        />
                    ) : undefined
                }
                vm={vm}
                behavior={behavior}
                floatingRef={popover.setFloating}
                floatingStyles={popover.styles}
            />
        </div>
    );
}
