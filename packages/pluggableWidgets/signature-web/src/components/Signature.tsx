import classNames from "classnames";
import { ReactElement } from "react";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { If } from "@mendix/widget-plugin-component-kit/If";
import { Grid } from "./Grid";
import { SizeContainer } from "./SizeContainer";
import { SignatureContainerProps } from "../../typings/SignatureProps";
import { useSignaturePad } from "../utils/useSignaturePad";
import Utils from "../utils/Utils";

export function SignatureComponent(props: SignatureContainerProps): ReactElement {
    const { class: className, imageSource, fileName, onSignEndAction, ariaLabel, ariaRequired } = props;
    const { validation, readOnly } = imageSource;
    const showGrid = props.showGrid && !readOnly;

    const handleSignEnd = (imageDataUrl?: string): void => {
        if (imageDataUrl && !readOnly) {
            const customFileName = fileName?.value || Utils.generateFileName("signature");
            imageSource.setValue(Utils.convertUrlToBlob(imageDataUrl, customFileName));
        }

        // Trigger microflow to update signature attribute
        if (onSignEndAction && !onSignEndAction.isExecuting && onSignEndAction.canExecute && !readOnly) {
            onSignEndAction.execute({ signatureImage: imageDataUrl });
        }
    };

    const { canvasRef, containerRef } = useSignaturePad(props, handleSignEnd);

    return (
        <SizeContainer
            {...props}
            ref={containerRef}
            className={classNames("widget-signature", className)}
            readOnly={readOnly}
        >
            {validation && <ValidationAlert>{validation}</ValidationAlert>}
            <If condition={showGrid}>
                <Grid {...props} />
            </If>
            <canvas
                className="widget-signature-canvas"
                ref={canvasRef}
                aria-label={ariaLabel?.value}
                aria-required={ariaRequired?.value === true ? "true" : undefined}
            >
                <p>{ariaLabel?.value}</p>
            </canvas>
        </SizeContainer>
    );
}
