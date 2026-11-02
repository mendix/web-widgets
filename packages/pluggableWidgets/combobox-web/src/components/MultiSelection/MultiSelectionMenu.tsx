import { CSSProperties, ReactElement, ReactNode, Ref } from "react";
import { Checkbox } from "../../assets/icons";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";

interface MultiSelectionMenuProps {
    vm: ComboboxViewModel;
    behavior: ComboboxBehavior;
    menuHeaderContent?: ReactNode;
    floatingRef?: Ref<HTMLDivElement>;
    floatingStyles?: CSSProperties;
}

export function MultiSelectionMenu({
    vm,
    behavior,
    menuHeaderContent,
    floatingRef,
    floatingStyles
}: MultiSelectionMenuProps): ReactElement {
    const { options, loading, isOpen } = vm;
    const withCheckbox = vm.hints.selectionMethod === "checkbox";

    return (
        <ComboboxMenuWrapper
            floatingRef={floatingRef}
            floatingStyles={floatingStyles}
            menuProps={behavior.getMenuProps()}
            highlightedIndex={vm.highlightedIndex}
            isEmpty={options.length <= 0}
            isLoading={loading.isLoading}
            isOpen={isOpen}
            lazyLoading={loading.lazy}
            loader={
                <Loader
                    isEmpty={options.length === 0}
                    isLoading={loading.isLoading}
                    isOpen={isOpen}
                    lazyLoading={loading.lazy}
                    loadingType={vm.hints.loadingType}
                    withCheckbox={withCheckbox}
                />
            }
            menuFooterContent={vm.slots.menuFooter}
            menuHeaderContent={menuHeaderContent}
            noOptionsText={vm.t("noOptions")}
        >
            {isOpen &&
                options.map((option, index) => {
                    const optionProps = behavior.getOptionProps(index);
                    return (
                        <ComboboxOptionWrapper
                            key={option.id}
                            isHighlighted={option.highlighted}
                            isSelected={optionProps["aria-selected"] as boolean | undefined}
                            optionProps={optionProps}
                        >
                            {withCheckbox && (
                                <Checkbox
                                    checked={optionProps["aria-selected"] as boolean | undefined}
                                    id={`${vm.id}_${option.id}`}
                                />
                            )}
                            {option.content}
                        </ComboboxOptionWrapper>
                    );
                })}
        </ComboboxMenuWrapper>
    );
}
