import { ReactElement } from "react";
import { SignaturePreviewProps } from "typings/SignatureProps";
import classNames from "classnames";

export function preview(_props: SignaturePreviewProps): ReactElement {
    return <div className={classNames("widget-Signature-preview")}>{"Signature"}</div>;
}
