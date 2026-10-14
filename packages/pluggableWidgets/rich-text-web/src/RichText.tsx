import classNames from "classnames";
import { Fragment, ReactElement } from "react";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { RichTextContainerProps } from "../typings/RichTextProps";
import EditorWrapper from "./components/EditorWrapper";
import "./ui/RichText.scss";

export default function RichText(props: RichTextContainerProps): ReactElement {
    const { stringAttribute, readOnlyStyle } = props;
    return (
        <Fragment>
            {stringAttribute.status === "loading" ? (
                <div className="mx-progress"></div>
            ) : (
                <EditorWrapper
                    {...props}
                    className={classNames(
                        "widget-rich-text",
                        stringAttribute.readOnly && readOnlyStyle === "readPanel"
                            ? "form-control-static"
                            : "form-control"
                    )}
                />
            )}
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </Fragment>
    );
}
