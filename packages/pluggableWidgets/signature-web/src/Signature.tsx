import { ReactElement, useCallback } from "react";
import { SignatureContainerProps } from "../typings/SignatureProps";
import { SignatureComponent } from "./components/Signature";
import "./ui/Signature.scss";

export default function Signature(props: SignatureContainerProps): ReactElement {
    const { class: className, onSignEndAction } = props;
    const handleSignEnd = useCallback(
        (imageDataUrl?: string) => {
            if (onSignEndAction && !onSignEndAction.isExecuting && onSignEndAction.canExecute) {
                onSignEndAction.execute({ signatureImage: imageDataUrl });
            }
        },
        [onSignEndAction]
    );
    return (
        <SignatureComponent
            readOnly={false}
            {...props}
            className={className}
            onSignEndAction={handleSignEnd}
            clearSignature={false}
        />
    );
}
