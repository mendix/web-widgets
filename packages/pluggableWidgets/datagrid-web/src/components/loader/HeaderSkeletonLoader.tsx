import { createElement, ReactElement } from "react";
import { SkeletonLoader } from "./SkeletonLoader";

type HeaderSkeletonLoaderProps = {
    size: number;
};

export function HeaderSkeletonLoader({ size }: HeaderSkeletonLoaderProps): ReactElement {
    return (
        <div key="headers_row" className="tr" role="row">
            {Array.from({ length: size }).map((_, index) => (
                <div className="th" role="columnheader" key={index}>
                    <div className="column-container">
                        <div className="column-header align-column-left">
                            <span>
                                <SkeletonLoader />
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
