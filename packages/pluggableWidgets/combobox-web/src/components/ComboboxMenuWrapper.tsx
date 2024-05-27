import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import {
    createElement,
    MouseEvent,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useState
} from "react";
import { LoadingTypeEnum } from "typings/ComboboxProps";
import { InfiniteBodyProps, useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import { useMenuStyle } from "../hooks/useMenuStyle";
import { NoOptionsPlaceholder } from "./Placeholder";
import { SpinnerLoader } from "./SpinnerLoader";
import { SkeletonLoader } from "./SkeletonLoader";

interface ComboboxMenuWrapperProps
    extends PropsWithChildren,
        Partial<UseComboboxPropGetters<string>>,
        Pick<InfiniteBodyProps, "hasMoreItems" | "isInfinite"> {
    isOpen: boolean;
    isEmpty: boolean;
    noOptionsText?: string;
    alwaysOpen?: boolean;
    highlightedIndex?: number | null;
    menuHeaderContent?: ReactNode;
    menuFooterContent?: ReactNode;
    onOptionClick?: (e: MouseEvent) => void;
    numberOfItems: number;
    loadingType?: LoadingTypeEnum;
    setPage?: () => void;
}

function PreventMenuCloseEventHandler(e: React.MouseEvent): void {
    e.stopPropagation();
}

function ForcePreventMenuCloseEventHandler(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
}

export function ComboboxMenuWrapper(props: ComboboxMenuWrapperProps): ReactElement {
    const {
        children,
        isOpen,
        isEmpty,
        noOptionsText,
        alwaysOpen,
        getMenuProps,
        menuHeaderContent,
        menuFooterContent,
        highlightedIndex,
        onOptionClick,
        hasMoreItems,
        isInfinite,
        setPage,
        numberOfItems,
        loadingType
    } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [firstLoad, setFirstLoad] = useState(false);

    const [ref, style] = useMenuStyle<HTMLDivElement>(isOpen);
    const setPageCallback = useCallback(() => {
        if (setPage) {
            setIsLoading(true);
            setPage();
        }
    }, [setPage]);
    const [trackScrolling] = useInfiniteControl({ hasMoreItems, isInfinite, setPage: setPageCallback });

    useEffect(() => {
        if (firstLoad === false && isInfinite === true && isOpen === true) {
            setFirstLoad(true);
            setPageCallback();
        }
    }, [firstLoad, isInfinite, isOpen]);

    useEffect(() => {
        setIsLoading(false);
    }, [numberOfItems]);

    const Loader = loadingType === "skeleton" ? SkeletonLoader : SpinnerLoader;

    return (
        <div
            ref={ref}
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            style={
                alwaysOpen
                    ? {
                          display: "block",
                          visibility: "visible",
                          position: "relative"
                      }
                    : style
            }
        >
            {menuHeaderContent && (
                <div
                    className="widget-combobox-menu-header widget-combobox-item"
                    onMouseDown={PreventMenuCloseEventHandler}
                    tabIndex={0}
                >
                    {menuHeaderContent}
                </div>
            )}
            <ul
                className={classNames("widget-combobox-menu-list", {
                    "widget-combobox-menu-highlighted": (highlightedIndex ?? -1) >= 0,
                    "infinite-loading": isInfinite
                })}
                {...getMenuProps?.(
                    {
                        onClick: onOptionClick,
                        onMouseDown: ForcePreventMenuCloseEventHandler,
                        onScroll: isInfinite ? trackScrolling : undefined
                    },
                    { suppressRefError: true }
                )}
            >
                {isOpen && isInfinite && isLoading === true && <Loader />}
                {isOpen ? isEmpty ? <NoOptionsPlaceholder>{noOptionsText}</NoOptionsPlaceholder> : children : null}
            </ul>
            {menuFooterContent && (
                <div tabIndex={0} className="widget-combobox-menu-footer" onMouseDown={PreventMenuCloseEventHandler}>
                    {menuFooterContent}
                </div>
            )}
        </div>
    );
}
