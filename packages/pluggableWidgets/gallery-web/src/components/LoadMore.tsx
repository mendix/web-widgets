import cn from "classnames";
import { observer } from "mobx-react-lite";
import { JSX, ReactNode } from "react";
import { usePaginationVM, useTextsService } from "../model/hooks/injection-hooks";

export function LoadMoreButton(props: JSX.IntrinsicElements["button"]): ReactNode {
    return (
        <button {...props} className={cn("btn btn-primary widget-gallery-load-more-btn", props.className)}>
            {props.children}
        </button>
    );
}

export const LoadMore = observer(function LoadMore(): ReactNode {
    const paging = usePaginationVM();
    const texts = useTextsService();

    if (paging.pagination !== "loadMore") {
        return null;
    }

    if (!paging.hasMoreItems) {
        return null;
    }

    return <LoadMoreButton onClick={() => paging.setPage(n => n + 1)}>{texts.loadMoreCaption}</LoadMoreButton>;
});
