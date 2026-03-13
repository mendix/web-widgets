import classNames from "classnames";
import { ReactElement } from "react";

import { useSignaturePad } from "src/utils/useSignaturePad";
import Utils from "../utils/Utils";
import { SignatureProps } from "../utils/customTypes";
import { Alert } from "./Alert";
import { Grid } from "./Grid";
import { SizeContainer } from "./SizeContainer";

export function SignatureComponent(props: SignatureProps): ReactElement {
    const { className, alertMessage, wrapperStyle, imageSource, hasSignatureAttribute, onSignEndAction } = props;

    const handleSignEnd = (imageDataUrl?: string): void => {
        if (imageDataUrl) {
            imageSource.setValue(Utils.convertUrlToBlob(imageDataUrl));
        }

        if (hasSignatureAttribute) {
            hasSignatureAttribute.setValue(true);
        }

        // Trigger microflow to update signature attribute
        if (onSignEndAction) {
            onSignEndAction(imageDataUrl);
        }
    };

    const { canvasRef, signaturePadRef } = useSignaturePad(props, handleSignEnd);

    const onResize = (): void => {
        if (canvasRef.current) {
            canvasRef.current.width =
                canvasRef.current && canvasRef.current.parentElement ? canvasRef.current.parentElement.offsetWidth : 0;
            canvasRef.current.height =
                canvasRef.current && canvasRef.current.parentElement ? canvasRef.current.parentElement.offsetHeight : 0;
            signaturePadRef.current?.redraw();
        }
    };

    return (
        <SizeContainer
            {...props}
            className={classNames("widget-signature", className)}
            classNameInner="widget-signature-wrapper form-control mx-textarea-input mx-textarea"
            style={wrapperStyle}
            onResize={onResize}
        >
            <Alert bootstrapStyle="danger">{alertMessage}</Alert>
            <Grid {...props} />
            <canvas className="widget-signature-canvas" ref={canvasRef} />
        </SizeContainer>
    );
}
