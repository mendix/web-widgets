import { UseComboboxPropGetters } from "downshift/typings";
import { CSSProperties, ReactElement, ReactNode, Ref } from "react";
import { SingleSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";

interface ComboboxMenuProps extends Partial<UseComboboxPropGetters<string>> {
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
    noOptionsText?: string;
    alwaysOpen?: boolean;
    menuFooterContent?: ReactNode;
    isLoading: boolean;
    lazyLoading: boolean;
    onScroll: (e: any) => void;
    floatingRef?: Ref<HTMLDivElement>;
    floatingStyles?: CSSProperties;
}

export function SingleSelectionMenu({
    isOpen,
    selector,
    highlightedIndex,
    getMenuProps,
    getItemProps,
    noOptionsText,
    alwaysOpen,
    menuFooterContent,
    isLoading,
    lazyLoading,
    onScroll,
    floatingRef,
    floatingStyles
}: ComboboxMenuProps): ReactElement {
    const items = selector.options.getAll();

    return (
        <ComboboxMenuWrapper
            alwaysOpen={alwaysOpen}
            floatingRef={floatingRef}
            floatingStyles={floatingStyles}
            getMenuProps={getMenuProps}
            isEmpty={items?.length <= 0}
            isLoading={isLoading}
            isOpen={isOpen}
            lazyLoading={lazyLoading}
            loader={
                <Loader
                    isLoading={isLoading}
                    isOpen={isOpen}
                    lazyLoading={lazyLoading}
                    loadingType={selector.loadingType}
                    withCheckbox={false}
                    isEmpty={items.length === 0}
                />
            }
            menuFooterContent={menuFooterContent}
            noOptionsText={noOptionsText}
            onScroll={lazyLoading ? onScroll : undefined}
        >
            {isOpen &&
                items.map((item, index) => (
                    <ComboboxOptionWrapper
                        key={item}
                        isHighlighted={alwaysOpen ? false : highlightedIndex === index}
                        isSelected={selector.currentId === item}
                        item={item}
                        getItemProps={getItemProps}
                        index={index}
                    >
                        {selector.caption.render(item, "options")}
                    </ComboboxOptionWrapper>
                ))}
        </ComboboxMenuWrapper>
    );
}
