import { createElement, Fragment, ReactElement } from "react";
import { CellElement } from "../CellElement";
import { SkeletonLoader } from "./SkeletonLoader";
import { useWidgetProps } from "src/helpers/useWidgetProps";
import { SelectorCell } from "../SelectorCell";

type RowSkeletonLoaderProps = {
    columnsHidable: boolean;
    columnsSize: number;
    pageSize: number;
};

export function RowSkeletonLoader({ columnsHidable, columnsSize, pageSize }: RowSkeletonLoaderProps): ReactElement {
    const { selectActionHelper } = useWidgetProps();
    return (
        <Fragment>
            {Array.from({ length: pageSize }).map((_, i) => (
                <div className="tr" role="row" key={i}>
                    {selectActionHelper.showCheckboxColumn && (
                        <CellElement borderTop={i == 0} className="widget-datagrid-col-select" tabIndex={-1}>
                            <input type="checkbox" />
                        </CellElement>
                    )}
                    {Array.from({ length: columnsSize }).map((_, j) => (
                        <CellElement alignment="left" borderTop={i === 0} key={`${i}-${j}`}>
                            <SkeletonLoader />
                        </CellElement>
                    ))}
                    {columnsHidable && <SelectorCell key="column_selector_cell" borderTop={i == 0} tabIndex={-1} />}
                </div>
            ))}
        </Fragment>
    );
}
