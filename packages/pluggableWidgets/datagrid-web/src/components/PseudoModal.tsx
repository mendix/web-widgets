import { createElement, ReactElement, PropsWithChildren } from "react";

export function PseudoModal(props: PropsWithChildren): ReactElement {
    return (
        <div className="widget-datagrid-modal-root" role="presentation">
            <div className="widget-datagrid-modal-overlay" role="presentation" />
            <div className="widget-datagrid-modal-main" role="presentation">
                {props.children}
            </div>
        </div>
    );
}
