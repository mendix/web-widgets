import { Fragment, ReactElement, createElement, useMemo, useRef } from "react";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";
import { useLazyLoading } from "../../hooks/useLazyLoading";

export function SingleSelection({
    selector,
    tabIndex = 0,
    a11yConfig,
    keepMenuOpen,
    menuFooterContent,
    ariaRequired,
    ...options
}: SelectionBaseProps<SingleSelector>): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const lazyLoading = selector.lazyLoading ?? false;
    // const { onScroll } = useLazyLoading({
    //     hasMoreItems: selector.options.hasMore ?? false,
    //     isInfinite: lazyLoading,
    //     isOpen: true,
    //     loadMore: () => {
    //         if (selector.options.loadMore) {
    //             selector.options.loadMore();
    //         }
    //     },
    //     datasourceFilter: selector.options.datasourceFilter,
    //     readOnly: selector.readOnly
    // });

    // const selectedItemCaption = useMemo(
    //     () => selector.caption.render(selectedItem, "label"),
    //     [
    //         selectedItem,
    //         selector.status,
    //         selector.caption,
    //         selector.caption.emptyCaption,
    //         selector.currentId,
    //         selector.caption.formatter
    //     ]
    // );
    const items = selector.options.getAll();
    return (
        <Fragment>
            {items.length > 0
                ? items.map((item, index) => (
                      <div
                          key={item}
                          className={`widget-selection-option ${selector.currentId === item ? "selected" : ""}`}
                          tabIndex={tabIndex}
                      >
                          <input type="radio" id={`${item}_${index}`} name="fav_language" value={item} />
                          <label htmlFor={`${item}_${index}`}>HTML</label>
                      </div>
                  ))
                : null}
        </Fragment>
    );
}
