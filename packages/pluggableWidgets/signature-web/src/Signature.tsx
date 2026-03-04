import { ReactElement, useCallback } from "react";
import { SignatureContainerProps } from "../typings/SignatureProps";
import { SignatureComponent } from "./components/Signature";
import "./ui/Signature.scss";
// import Utils from "./utils/Utils";

export default function Signature(props: SignatureContainerProps): ReactElement {
    const { class: className } = props;
    const handleSignEnd = useCallback(() => {}, []);
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
