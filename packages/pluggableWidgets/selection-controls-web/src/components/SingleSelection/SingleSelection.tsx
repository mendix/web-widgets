import { Fragment, ReactElement, createElement } from "react";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";

export function SingleSelection({
    selector,
    tabIndex = 0
    // a11yConfig,
    // keepMenuOpen,
    // menuFooterContent,
    // ariaRequired,
    // ...options
}: SelectionBaseProps<SingleSelector>): ReactElement {
    // const inputRef = useRef<HTMLInputElement>(null);
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
                          <input
                              type="radio"
                              id={`${item}_${index}`}
                              name={selector.groupName}
                              value={item}
                              onChange={() => {
                                  selector.setValue(item);
                              }}
                          />
                          <label htmlFor={`${item}_${index}`}>{selector.caption.render(item)}</label>
                      </div>
                  ))
                : null}
        </Fragment>
    );
}
