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

    const { canvasRef, onResize } = useSignaturePad(props, handleSignEnd);

    return (
        <SizeContainer
            {...props}
            className={classNames("widget-signature", className)}
            classNameInner={classNames("widget-signature-wrapper", "form-control", "mx-textarea-input", "mx-textarea", {
                disabled: readOnly
            })}
            onResize={onResize}
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
