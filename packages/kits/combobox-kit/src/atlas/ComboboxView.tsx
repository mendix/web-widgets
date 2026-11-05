import classNames from "classnames";
import { ReactElement, useMemo } from "react";
import { ComboboxClasses, defaultClasses } from "./classes";
import { legacy } from "./legacyModifiers";
import { atlasParts, ComboboxParts } from "./parts";
import { ComboboxViewModel } from "../core/ComboboxViewModel";
import { useComboboxBehavior } from "../hooks/useComboboxBehavior";
import { ComboboxClassesContext, useComboboxClasses } from "../hooks/useComboboxClasses";
import { useComboboxPopover } from "../hooks/useComboboxPopover";

export interface ComboboxViewProps {
    vm: ComboboxViewModel;
    /** Replaces the Atlas class of each given key; the other keys keep their Atlas class. */
    classes?: Partial<ComboboxClasses>;
    /** Replaces the Atlas part of each given key; the other parts stay. */
    parts?: Partial<ComboboxParts>;
    /** Editor preview only: render the menu inline and always open. */
    keepMenuOpen?: boolean;
    /** Extra class on the root element. */
    className?: string;
}

/** The Atlas View: resolves the class map and the parts, then renders the composition. */
export function ComboboxView({
    vm,
    classes: classOverrides,
    parts,
    keepMenuOpen,
    className
}: ComboboxViewProps): ReactElement {
    const classes = useMemo(() => ({ ...defaultClasses, ...classOverrides }), [classOverrides]);

    return (
        <ComboboxClassesContext.Provider value={classes}>
            <AtlasComposition vm={vm} parts={parts} keepMenuOpen={keepMenuOpen} className={className} />
        </ComboboxClassesContext.Provider>
    );
}

type CompositionProps = Omit<ComboboxViewProps, "classes">;

/** The composition of the parts: one tree for both modes, the chips and the select-all control multi-mode only. */
function AtlasComposition({ vm, parts, keepMenuOpen, className }: CompositionProps): ReactElement {
    const classes = useComboboxClasses();
    const P = { ...atlasParts, ...parts };
    const behavior = useComboboxBehavior(vm);
    const popover = useComboboxPopover(vm, { alwaysOpen: keepMenuOpen });

    const multi = vm.mode === "multi";
    const isOpen = vm.isOpen || keepMenuOpen === true;
    const textOnly = vm.readOnly && vm.hints.readOnlyStyle === "text";
    const withChips = multi && vm.hints.selectedItemsStyle === "boxes";
    const customContentEverywhere = !multi && vm.hints.customContent === "everywhere";
    const hasValue = multi ? vm.value !== null && vm.value.length > 0 : vm.value !== null;
    const inputProps = behavior.getInputProps();

    return (
        <div className={classNames(classes.root, className)} {...behavior.getRootProps()}>
            <P.InputContainer
                vm={vm}
                isOpen={isOpen}
                toggleProps={behavior.getToggleProps()}
                anchorRef={popover.setReference}
                hasSelection={multi && vm.chips.length > 0}
            >
                <div
                    className={classNames(classes.selectedItems, {
                        [legacy.selectedItemsBoxes]: multi && withChips,
                        [legacy.selectedItemsText]: multi && !withChips,
                        [legacy.selectedItemsCustom]: customContentEverywhere
                    })}
                    data-style={multi ? vm.hints.selectedItemsStyle : undefined}
                    data-custom={customContentEverywhere || undefined}
                >
                    {withChips &&
                        vm.chips.map((chip, index) => (
                            <P.Chip
                                key={chip.id}
                                vm={vm}
                                chip={chip}
                                index={index}
                                chipProps={behavior.getChipProps(index)}
                                removeProps={behavior.getChipRemoveProps(index)}
                            />
                        ))}
                    <input
                        className={classNames(classes.input, { [legacy.inputReadonly]: inputProps["data-readonly"] })}
                        {...inputProps}
                    />
                    <P.Placeholder vm={vm} />
                </div>
                {!vm.readOnly && vm.clearable && hasValue && <P.Clear clearProps={behavior.getClearProps()} />}
                {!textOnly && <P.Toggle vm={vm} isOpen={isOpen} />}
            </P.InputContainer>
            <P.Validation vm={vm} />
            <P.Menu
                isOpen={isOpen}
                alwaysOpen={keepMenuOpen}
                floatingRef={popover.setFloating}
                floatingStyles={popover.styles}
                menuProps={behavior.getMenuProps()}
                header={
                    multi && vm.canSelectAll ? <P.SelectAll selectAllProps={behavior.getSelectAllProps()} /> : undefined
                }
                footer={vm.slots.menuFooter}
            >
                {isOpen &&
                    (vm.options.length === 0 && !vm.loading.isLoading ? (
                        <P.NoOptions vm={vm} />
                    ) : (
                        vm.options.map((option, index) => {
                            const optionProps = behavior.getOptionProps(index);
                            return (
                                <P.Option
                                    key={option.id}
                                    vm={vm}
                                    option={option}
                                    index={index}
                                    // The editor preview keeps its menu open and never shows a highlight.
                                    optionProps={
                                        keepMenuOpen ? { ...optionProps, "data-highlighted": undefined } : optionProps
                                    }
                                />
                            );
                        })
                    ))}
                <P.Loader vm={vm} isOpen={isOpen} />
            </P.Menu>
        </div>
    );
}
