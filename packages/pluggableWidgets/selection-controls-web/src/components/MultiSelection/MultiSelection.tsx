import { Fragment, ReactElement, createElement } from "react";
import { MultiSelector, SelectionBaseProps } from "../../helpers/types";
// import { getSelectedCaptionsPlaceholder } from "../../helpers/utils";

export function MultiSelection({
    selector,
    tabIndex
    // a11yConfig,
    // menuFooterContent,
    // ariaRequired,
    // ...options
}: SelectionBaseProps<MultiSelector>): ReactElement {
    // const inputRef = useRef<HTMLInputElement>(null);

    // const memoizedselectedCaptions = useMemo(
    //     () => getSelectedCaptionsPlaceholder(selector, selectedItems),
    //     [selector, selectedItems]
    // );

    // const lazyLoading = selector.lazyLoading ?? false;
    // const { onScroll } = useLazyLoading({
    //     hasMoreItems: selector.options.hasMore ?? false,
    //     isInfinite: lazyLoading,
    //     isOpen,
    //     loadMore: () => {
    //         if (selector.options.loadMore) {
    //             selector.options.loadMore();
    //         }
    //     },
    //     readOnly: selector.readOnly
    // });
    const items = selector.options.getAll();
    return (
        <Fragment>
            {items.length > 0
                ? items.map((item, index) => (
                      <div key={item} className={`widget-selection-option`} tabIndex={tabIndex}>
                          <input type="checkbox" id={`${item}_${index}`} name="fav_language" value={item} />
                          <label htmlFor={`${item}_${index}`}>{selector.caption.render(item)}</label>
                      </div>
                  ))
                : null}
        </Fragment>
    );
}
