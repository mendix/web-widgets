import classNames from "classnames";
import { Fragment, ReactElement, ReactNode, RefObject } from "react";
import { LoadingTypeEnum } from "../../typings/DatagridProps";
import { SpinnerLoader } from "./loader/SpinnerLoader";
import { RowSkeletonLoader } from "./loader/RowSkeletonLoader";

interface Props {
    className?: string;
    children?: ReactNode;
    loadingType: LoadingTypeEnum;
    isFirstLoad: boolean;
    isFetchingNextBatch?: boolean;
    columnsHidable: boolean;
    columnsSize: number;
    rowsSize: number;
    pageSize: number;
    trackScrolling?: (e: any) => void;
    bodyRef: RefObject<HTMLDivElement | null>;
}

export function GridBody(props: Props): ReactElement {
    const { children, bodyRef, trackScrolling } = props;

    const content = (): ReactElement => {
        if (props.isFirstLoad) {
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
        <div
            className={classNames("widget-datagrid-grid-body table-content", props.className)}
            role="rowgroup"
            ref={bodyRef}
            onScroll={trackScrolling}
        >
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
