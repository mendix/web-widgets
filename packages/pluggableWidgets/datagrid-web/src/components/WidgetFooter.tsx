import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { PaginationEnum } from "../../typings/DatagridProps";
import { useDatagridRootScope } from "../helpers/root-context";
import { SelectionCounter } from "./SelectionCounter";

type WidgetFooterProps = {
    pagination: ReactNode;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;
    hasMoreItems: boolean;
    setPage?: (computePage: (prevPage: number) => number) => void;
} & ComponentPropsWithoutRef<"div">;

export const WidgetFooter = observer(function WidgetFooter(props: WidgetFooterProps): ReactElement | null {
    const { selectionCounterViewModel: counter } = useDatagridRootScope();
    const { pagination, paginationType, loadMoreButtonCaption, hasMoreItems, setPage, ...rest } = props;

    return (
        <div {...rest} className="widget-datagrid-footer table-footer">
            <div className="widget-datagrid-paging-bottom">
                <If condition={counter.isBottomCounterVisible}>
                    <div className="widget-datagrid-pb-start">
                        <SelectionCounter />
                    </div>
                </If>
                <div className="widget-datagrid-pb-end">
                    {pagination}
                    {hasMoreItems && paginationType === "loadMore" && (
                        <button
                            className="btn btn-primary widget-datagrid-load-more"
                            onClick={() => setPage && setPage(prev => prev + 1)}
                            tabIndex={0}
                        >
                            {loadMoreButtonCaption}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});
