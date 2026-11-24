import { Fragment, ReactElement } from "react";
import { SelectorCell } from "./features/columns/SelectorCell";
import { useDatagridConfig } from "./features/core/tokens";
import { SkeletonLoader } from "./features/datasource/loader/SkeletonLoader";
import { CellElement } from "./ui/CellElement";

type RowSkeletonLoaderProps = {
    columnsHidable: boolean;
    columnsSize: number;
    pageSize: number;
    useBorderTop?: boolean;
};

export function RowSkeletonLoader({
    columnsHidable,
    columnsSize,
    pageSize,
    useBorderTop = true
}: RowSkeletonLoaderProps): ReactElement {
    const { checkboxColumnEnabled } = useDatagridConfig();
    return (
        <Fragment>
            {Array.from({ length: pageSize }).map((_, i) => {
                const borderTop = useBorderTop && i === 0;
                return (
                    <div className="tr" role="row" key={i}>
                        {checkboxColumnEnabled && (
                            <CellElement borderTop={borderTop} className="widget-datagrid-col-select" tabIndex={-1}>
                                <input type="checkbox" />
                            </CellElement>
                        )}
                        {Array.from({ length: columnsSize }).map((_, j) => (
                            <CellElement alignment="left" borderTop={borderTop} key={`${i}-${j}`}>
                                <SkeletonLoader />
                            </CellElement>
                        ))}
                        {columnsHidable && (
                            <SelectorCell key="column_selector_cell" borderTop={borderTop} tabIndex={-1} />
                        )}
                    </div>
                );
            })}
        </Fragment>
    );
}
