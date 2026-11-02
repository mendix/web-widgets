import { CSSProperties, ReactElement, ReactNode, Ref } from "react";
import { Checkbox } from "../../assets/icons";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";
import { OptionContent } from "../OptionContent";

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
            isEmpty={options.length <= 0}
            isLoading={loading.isLoading}
            isOpen={isOpen}
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
                    const checkboxId = withCheckbox ? `${vm.id}_${option.id}` : undefined;
                    return (
                        <ComboboxOptionWrapper key={option.id} optionProps={behavior.getOptionProps(index)}>
                            {withCheckbox && <Checkbox checked={option.selected} id={checkboxId} />}
                            <OptionContent
                                option={option}
                                placement="menu"
                                customContent={vm.hints.customContent}
                                htmlFor={checkboxId}
                            />
                        </ComboboxOptionWrapper>
                    );
                })}
        </ComboboxMenuWrapper>
    );
}
