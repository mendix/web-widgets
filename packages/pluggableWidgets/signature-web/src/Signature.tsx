import { ReactElement } from "react";
import { SignatureContainerProps } from "../typings/SignatureProps";
import { SignatureComponent } from "./components/Signature";
import "./ui/Signature.scss";

export default function Signature(props: SignatureContainerProps): ReactElement {
    const { class: className } = props;
    return <SignatureComponent {...props} className={className} />;
}
