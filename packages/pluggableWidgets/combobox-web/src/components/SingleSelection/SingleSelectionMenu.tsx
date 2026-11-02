import { CSSProperties, ReactElement, Ref } from "react";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";

interface ComboboxMenuProps {
    vm: ComboboxViewModel;
    behavior: ComboboxBehavior;
    isOpen: boolean;
    alwaysOpen?: boolean;
    floatingRef?: Ref<HTMLDivElement>;
    floatingStyles?: CSSProperties;
}

export function SingleSelectionMenu({
    vm,
    behavior,
    isOpen,
    alwaysOpen,
    floatingRef,
    floatingStyles
}: ComboboxMenuProps): ReactElement {
    const { options, loading } = vm;

    return (
        <ComboboxMenuWrapper
            alwaysOpen={alwaysOpen}
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
                    isLoading={loading.isLoading}
                    isOpen={isOpen}
                    lazyLoading={loading.lazy}
                    loadingType={vm.hints.loadingType}
                    withCheckbox={false}
                    isEmpty={options.length === 0}
                />
            }
            menuFooterContent={vm.slots.menuFooter}
            noOptionsText={vm.t("noOptions")}
        >
            {isOpen &&
                options.map((option, index) => (
                    <ComboboxOptionWrapper
                        key={option.id}
                        isHighlighted={alwaysOpen ? false : option.highlighted}
                        isSelected={option.selected}
                        optionProps={behavior.getOptionProps(index)}
                    >
                        {option.content}
                    </ComboboxOptionWrapper>
                ))}
        </ComboboxMenuWrapper>
    );
}
