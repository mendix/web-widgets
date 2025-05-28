import classNames from "classnames";
import { createElement, Fragment, ReactElement } from "react";
import { LoadingTypeEnum } from "../../typings/DatagridProps";
import { SpinnerLoader } from "./loader/SpinnerLoader";
import { RowSkeletonLoader } from "./loader/RowSkeletonLoader";

interface Props {
    className?: string;
    children?: React.ReactNode;
    loadingType: LoadingTypeEnum;
    isLoading: boolean;
    isFetchingNextBatch?: boolean;
    columnsHidable: boolean;
    columnsSize: number;
    rowsSize: number;
    pageSize: number;
}

export function GridBody(props: Props): ReactElement {
    const { children } = props;

    const content = (): React.ReactElement => {
        if (props.isLoading) {
            return <Loader {...props} rowsSize={props.rowsSize > 0 ? props.rowsSize : props.pageSize} />;
        }
        return (
            <Fragment>
                {children}
                {props.isFetchingNextBatch && <Loader {...props} rowsSize={props.pageSize} useBorderTop={false} />}
            </Fragment>
        );
    };

    return (
        <div className={classNames("widget-datagrid-grid-body table-content", props.className)} role="rowgroup">
            {content()}
        </div>
    );
}

interface LoaderProps {
    loadingType: LoadingTypeEnum;
    columnsHidable: boolean;
    columnsSize: number;
    rowsSize: number;
    useBorderTop?: boolean;
}

function Loader(props: LoaderProps): ReactElement {
    if (props.loadingType === "spinner") {
        return (
            <div className="widget-datagrid-loader-container">
                <SpinnerLoader withMargins size="large" />
            </div>
        );
    }

    return (
        <RowSkeletonLoader
            columnsHidable={props.columnsHidable}
            columnsSize={props.columnsSize}
            pageSize={props.rowsSize}
            useBorderTop={props.useBorderTop}
        />
    );
}
