import { UseComboboxPropGetters } from "downshift/typings";
import { CSSProperties, ReactElement, Ref } from "react";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";

interface ComboboxMenuProps extends Partial<UseComboboxPropGetters<string>> {
    vm: ComboboxViewModel;
    isOpen: boolean;
    highlightedIndex: number | null;
    alwaysOpen?: boolean;
    onScroll: (e: any) => void;
    floatingRef?: Ref<HTMLDivElement>;
    floatingStyles?: CSSProperties;
}

export function SingleSelectionMenu({
    vm,
    isOpen,
    highlightedIndex,
    getMenuProps,
    getItemProps,
    alwaysOpen,
    onScroll,
    floatingRef,
    floatingStyles
}: ComboboxMenuProps): ReactElement {
    const { options, loading } = vm;

    return (
        <ComboboxMenuWrapper
            alwaysOpen={alwaysOpen}
            floatingRef={floatingRef}
            floatingStyles={floatingStyles}
            getMenuProps={getMenuProps}
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
            onScroll={loading.lazy ? onScroll : undefined}
        >
            {isOpen &&
                options.map((option, index) => (
                    <ComboboxOptionWrapper
                        key={option.id}
                        isHighlighted={alwaysOpen ? false : highlightedIndex === index}
                        isSelected={option.selected}
                        item={option.id}
                        getItemProps={getItemProps}
                        index={index}
                    >
                        {option.content}
                    </ComboboxOptionWrapper>
                ))}
        </ComboboxMenuWrapper>
    );
}
