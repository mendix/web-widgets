import classNames from "classnames";
import { ReactElement } from "react";
import { ClearButton } from "../../assets/icons";
import { getValidationErrorId } from "../../helpers/utils";
import { useComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxPopover } from "../../hooks/useComboboxPopover";
import { Caption } from "../Caption";
import { classes } from "../classes";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { legacy } from "../legacyModifiers";
import { OptionContent } from "../OptionContent";
import { InputPlaceholder } from "../Placeholder";
import { SelectionProps } from "../SelectionProps";
import { SingleSelectionMenu } from "./SingleSelectionMenu";

export function SingleSelection({ vm, keepMenuOpen, className }: SelectionProps): ReactElement {
    const behavior = useComboboxBehavior(vm);
    const popover = useComboboxPopover(vm, { alwaysOpen: keepMenuOpen });
    const isOpen = vm.isOpen || keepMenuOpen === true;
    const customContentEverywhere = vm.hints.customContent === "everywhere";
    const inputProps = behavior.getInputProps();

    return (
        <div className={classNames(classes.root, className)} {...behavior.getRootProps()}>
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
                    className={classNames(classes.selectedItems, {
                        [legacy.selectedItemsCustom]: customContentEverywhere
                    })}
                    data-custom={customContentEverywhere || undefined}
                >
                    <input
                        className={classNames(classes.input, { [legacy.inputReadonly]: inputProps["data-readonly"] })}
                        {...inputProps}
                    />
                    <InputPlaceholder isEmpty={!vm.value} custom={customContentEverywhere}>
                        {vm.selected ? (
                            <OptionContent
                                option={vm.selected}
                                placement="input"
                                customContent={vm.hints.customContent}
                            />
                        ) : (
                            <Caption>{vm.selectedCaption}</Caption>
                        )}
                    </InputPlaceholder>
                </div>
                {!vm.readOnly && vm.clearable && vm.value !== null && (
                    <button className={classes.clear} {...behavior.getClearProps()}>
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
