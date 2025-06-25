import cn from "classnames";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { useGalleryRootScope } from "src/helpers/root-context";

export function LoadMoreButton(props: JSX.IntrinsicElements["button"]): React.ReactNode {
    return <button {...props} className={cn("btn btn-primary widget-gallery-load-more-btn", props.className)}></button>;
}

export const LoadMore = observer(function LoadMore(props: { children: React.ReactNode }): React.ReactNode {
    const {
        rootStore: { paging }
    } = useGalleryRootScope();

    if (paging.pagination !== "loadMore") {
        return null;
    }

    if (!paging.hasMoreItems) {
        return null;
    }

    return <LoadMoreButton onClick={() => paging.setPage(n => n + 1)}>{props.children}</LoadMoreButton>;
});
