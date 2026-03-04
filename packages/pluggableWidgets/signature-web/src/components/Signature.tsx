import classNames from "classnames";
import { ReactElement, useEffect, useRef } from "react";
// import ReactResizeDetector from "react-resize-detector";
import SignaturePad, { Options } from "signature_pad";

import { Alert } from "./Alert";
import { Grid } from "./Grid";
import { Dimensions, SizeContainer } from "./SizeContainer";
import { SignatureContainerProps } from "typings/SignatureProps";
import Utils from "../utils/Utils";

export type penOptions = "fountain" | "ballpoint" | "marker";

export interface SignatureProps extends Dimensions, SignatureContainerProps {
    className: string;
    alertMessage?: string;
    clearSignature: boolean;
    showGrid: boolean;
    gridCellWidth: number;
    gridCellHeight: number;
    gridBorderColor: string;
    gridBorderWidth: number;
    penType: penOptions;
    penColor: string;
    onSignEndAction?: (imageUrl?: string) => void;
    wrapperStyle?: object;
    readOnly: boolean;
}

export function SignatureComponent(props: SignatureProps): ReactElement {
    const { className, alertMessage, wrapperStyle } = props;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const signaturePadRef = useRef<SignaturePad | null>(null);

    const handleSignEnd = (): void => {
        const imageDataUrl = signaturePadRef.current?.toDataURL();

        if (imageDataUrl) {
            props.imageSource.setValue(Utils.convertUrlToBlob(imageDataUrl));
        }
        // Trigger microflow to update signature attribute
        if (props.onSignEndAction) {
            props.onSignEndAction(signaturePadRef.current?.toDataURL());
        }
    };

    const signaturePadOptions = (): Options => {
        let options: Options = {};
        if (props.penType === "fountain") {
            options = { minWidth: 0.6, maxWidth: 2.6, velocityFilterWeight: 0.6 };
        } else if (props.penType === "ballpoint") {
            options = { minWidth: 1.4, maxWidth: 1.5, velocityFilterWeight: 1.5 };
        } else if (props.penType === "marker") {
            options = { minWidth: 2, maxWidth: 4, velocityFilterWeight: 0.9 };
        }
        return options;
    };

    useEffect(() => {
        if (canvasRef.current) {
            signaturePadRef.current = new SignaturePad(canvasRef.current, {
                penColor: props.penColor,
                ...signaturePadOptions()
            });
            signaturePadRef.current.addEventListener("endStroke", handleSignEnd);
            if (props.readOnly) {
                signaturePadRef.current?.off();
            }
        }
    }, []);

    const onResize = (): void => {
        if (canvasRef.current) {
            const data = signaturePadRef.current?.toData();
            canvasRef.current.width =
                canvasRef.current && canvasRef.current.parentElement ? canvasRef.current.parentElement.offsetWidth : 0;
            canvasRef.current.height =
                canvasRef.current && canvasRef.current.parentElement ? canvasRef.current.parentElement.offsetHeight : 0;
            signaturePadRef.current?.clear();
            if (data) {
                signaturePadRef.current?.fromData(data);
            }
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
