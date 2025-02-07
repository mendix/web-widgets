import { createElement, Fragment, ReactElement } from "react";
import { CellElement } from "../CellElement";
import { SkeletonLoader } from "./SkeletonLoader";
import { useWidgetProps } from "../../helpers/useWidgetProps";
import { SelectorCell } from "../SelectorCell";

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
    const { selectActionHelper } = useWidgetProps();
    return (
        <Fragment>
            {Array.from({ length: pageSize }).map((_, i) => {
                const borderTop = useBorderTop && i === 0;
                return (
                    <div className="tr" role="row" key={i}>
                        {selectActionHelper.showCheckboxColumn && (
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
