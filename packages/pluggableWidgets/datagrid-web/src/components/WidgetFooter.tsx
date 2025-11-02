import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { PaginationEnum } from "../../typings/DatagridProps";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";

type WidgetFooterProps = {
    pagination: ReactNode;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;
    hasMoreItems: boolean;
    setPage?: (computePage: (prevPage: number) => number) => void;
} & ComponentPropsWithoutRef<"div">;

export const WidgetFooter = observer(function WidgetFooter(props: WidgetFooterProps): ReactElement | null {
    const { pagination, paginationType, loadMoreButtonCaption, hasMoreItems, setPage, ...rest } = props;
    const selectionCounterVM = useSelectionCounterViewModel();

    return (
        <div {...rest} className="widget-datagrid-footer table-footer">
            <div className="widget-datagrid-paging-bottom">
                <div className="widget-datagrid-pb-start">
                    <If condition={selectionCounterVM.isBottomCounterVisible}>
                        <SelectionCounter />
                    </If>
                </div>
                {hasMoreItems && paginationType === "loadMore" && (
                    <div className="widget-datagrid-pb-middle">
                        <button
                            className="btn btn-primary widget-datagrid-load-more"
                            onClick={() => setPage && setPage(prev => prev + 1)}
                            tabIndex={0}
                        >
                            {loadMoreButtonCaption}
                        </button>
                    </div>
                )}
                <div className="widget-datagrid-pb-end">{pagination}</div>
            </div>
        </div>
    );
});
