import classNames from "classnames";
import { ReactElement } from "react";

import { useSignaturePad } from "src/utils/useSignaturePad";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { If } from "@mendix/widget-plugin-component-kit/If";
import { Grid } from "./Grid";
import { SizeContainer } from "./SizeContainer";
import { SignatureProps } from "../utils/customTypes";
import Utils from "../utils/Utils";

export function SignatureComponent(props: SignatureProps): ReactElement {
    const { className, alertMessage, wrapperStyle, imageSource, fileName, onSignEndAction } = props;
    const readOnly = imageSource.readOnly;
    const showGrid = props.showGrid && !readOnly;

    const handleSignEnd = (imageDataUrl?: string): void => {
        if (imageDataUrl) {
            const customFileName = fileName?.value || Utils.generateFileName("signature");
            imageSource.setValue(Utils.convertUrlToBlob(imageDataUrl, customFileName));
        }

        // Trigger microflow to update signature attribute
        if (onSignEndAction && !onSignEndAction.isExecuting && onSignEndAction.canExecute) {
            onSignEndAction.execute({ signatureImage: imageDataUrl });
        }
    };

    const { canvasRef, onResize } = useSignaturePad(props, handleSignEnd);

    return (
        <SizeContainer
            {...props}
            className={classNames("widget-signature", className)}
            classNameInner="widget-signature-wrapper form-control mx-textarea-input mx-textarea"
            style={wrapperStyle}
            onResize={onResize}
        >
            <Alert bootstrapStyle="danger">{alertMessage}</Alert>
            <If condition={showGrid}>
                <Grid {...props} />
            </If>
            <canvas className="widget-signature-canvas" ref={canvasRef} />
        </SizeContainer>
    );
}
