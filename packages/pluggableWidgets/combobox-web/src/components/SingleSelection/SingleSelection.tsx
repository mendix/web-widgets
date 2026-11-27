import classNames from "classnames";
import { ReactElement } from "react";
import { ClearButton } from "../../assets/icons";
import { getValidationErrorId } from "../../helpers/utils";
import { useComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxPopover } from "../../hooks/useComboboxPopover";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { SelectionProps } from "../SelectionProps";
import { SingleSelectionMenu } from "./SingleSelectionMenu";

export function SingleSelection({ vm, keepMenuOpen, className }: SelectionProps): ReactElement {
    const behavior = useComboboxBehavior(vm);
    const popover = useComboboxPopover(vm, { alwaysOpen: keepMenuOpen });
    const isOpen = vm.isOpen || keepMenuOpen === true;
    const customContentEverywhere = vm.hints.customContent === "everywhere";

    return (
        <div className={classNames("widget-combobox", className)} {...behavior.getRootProps()}>
            <ComboboxWrapper
                ref={popover.setReference}
                isOpen={isOpen}
                readOnly={vm.readOnly}
                readOnlyStyle={vm.hints.readOnlyStyle}
                toggleProps={behavior.getToggleProps()}
                validation={vm.validation}
                isLoading={vm.loading.lazy && vm.loading.isLoading}
                errorId={getValidationErrorId(vm.id)}
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
                        {...behavior.getInputProps()}
                    />
                    <InputPlaceholder isEmpty={!vm.value} type={customContentEverywhere ? "custom" : "text"}>
                        {vm.selectedContent}
                    </InputPlaceholder>
                </div>
                {!vm.readOnly && vm.clearable && vm.value !== null && (
                    <button className="widget-combobox-clear-button" {...behavior.getClearProps()}>
                        <ClearButton />
                    </button>
                )}
            </ComboboxWrapper>
            <SingleSelectionMenu
                vm={vm}
                behavior={behavior}
                isOpen={isOpen}
                alwaysOpen={keepMenuOpen}
                floatingRef={popover.setFloating}
                floatingStyles={popover.styles}
            />
        </div>
    );
}
