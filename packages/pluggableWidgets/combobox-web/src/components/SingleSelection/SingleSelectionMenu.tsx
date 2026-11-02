import { CSSProperties, ReactElement, Ref } from "react";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";
import { OptionContent } from "../OptionContent";

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
            isEmpty={options.length <= 0}
            isLoading={loading.isLoading}
            isOpen={isOpen}
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
                options.map((option, index) => {
                    const optionProps = behavior.getOptionProps(index);
                    return (
                        <ComboboxOptionWrapper
                            key={option.id}
                            // The editor preview keeps its menu open and never shows a highlight.
                            optionProps={alwaysOpen ? { ...optionProps, "data-highlighted": undefined } : optionProps}
                        >
                            <OptionContent option={option} placement="menu" customContent={vm.hints.customContent} />
                        </ComboboxOptionWrapper>
                    );
                })}
        </ComboboxMenuWrapper>
    );
}
