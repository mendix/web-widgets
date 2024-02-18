import { createElement } from "react";
import { RichTextContainerProps } from "../typings/RichTextProps";
import BundledEditor from "./components/Editor";
import "./ui/RichText.scss";

export default function RichText(props: RichTextContainerProps): JSX.Element {
    const { stringAttribute } = props;

    if (stringAttribute.status === "loading") {
        return <div></div>;
    }

    return <BundledEditor {...props} />;
}
