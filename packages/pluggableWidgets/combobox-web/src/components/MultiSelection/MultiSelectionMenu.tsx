import { UseComboboxPropGetters } from "downshift/typings";
import { CSSProperties, MouseEvent, ReactElement, ReactNode, Ref } from "react";
import { Checkbox } from "../../assets/icons";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<string>> {
    vm: ComboboxViewModel;
    isOpen: boolean;
    highlightedIndex: number | null;
    menuHeaderContent?: ReactNode;
    onOptionClick?: (e: MouseEvent) => void;
    onScroll: (e: any) => void;
    floatingRef?: Ref<HTMLDivElement>;
    floatingStyles?: CSSProperties;
}

export function MultiSelectionMenu({
    vm,
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    menuHeaderContent,
    onOptionClick,
    onScroll,
    floatingRef,
    floatingStyles
}: MultiSelectionMenuProps): ReactElement {
    const { options, loading } = vm;
    const withCheckbox = vm.hints.selectionMethod === "checkbox";

    return (
        <ComboboxMenuWrapper
            floatingRef={floatingRef}
            floatingStyles={floatingStyles}
            getMenuProps={getMenuProps}
            highlightedIndex={highlightedIndex}
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
            onOptionClick={onOptionClick}
            onScroll={loading.lazy ? onScroll : undefined}
        >
            {isOpen &&
                options.map((option, index) => {
                    // Quirk: while the selector has no value at all (not even an empty list), options
                    // used to get no aria-selected attribute instead of "false". Kept until step 4.
                    const isSelected = vm.value === null ? undefined : option.selected;

                    return (
                        <ComboboxOptionWrapper
                            key={option.id}
                            isHighlighted={highlightedIndex === index}
                            isSelected={isSelected}
                            item={option.id}
                            getItemProps={getItemProps}
                            index={index}
                        >
                            {withCheckbox && <Checkbox checked={isSelected} id={`${vm.id}_${option.id}`} />}
                            {option.content}
                        </ComboboxOptionWrapper>
                    );
                })}
        </ComboboxMenuWrapper>
    );
}
