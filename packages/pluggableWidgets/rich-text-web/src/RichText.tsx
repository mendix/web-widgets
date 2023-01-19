import { createElement } from "react";
import { RichTextContainerProps } from "../typings/RichTextProps";
import "./ui/RichText.scss";
import { RichText as Component } from "./components/RichText";

export default function RichText(props: RichTextContainerProps): JSX.Element {
    return createElement(Component, props);
}
