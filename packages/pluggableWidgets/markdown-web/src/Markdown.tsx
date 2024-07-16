import MarkdownIt from "markdown-it";
import { ReactNode, createElement, useRef, useEffect } from "react";
import { MarkdownContainerProps } from "../typings/MarkdownProps";
import "./ui/Markdown.scss";
import { MarkdownIcon } from "../assets/icons";
import classNames from "classnames";
const mdParser = new MarkdownIt("default", {
    typographer: true,
    linkify: true
});

export function Markdown(props: MarkdownContainerProps): ReactNode {
    const { stringAttribute, showFooter } = props;
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.innerHTML = mdParser.render(stringAttribute.value ?? "");
        }
    }, [stringAttribute?.value, stringAttribute?.status]);

    return (
        <div className="widget-markdown">
            <div className="widget-markdown-topbar">
                <button className={classNames("widget-markdown-topbar-preview-button")}>Markdown preview</button>
            </div>
            <div className="widget-markdown-content">
                {stringAttribute?.status === "available" && (
                    <div className="widget-markdown-content-preview" ref={previewRef}></div>
                )}
            </div>
            {showFooter && (
                <div className="widget-markdown-footer">
                    <MarkdownIcon />
                    <div className="info">Markdown is supported</div>
                </div>
            )}
        </div>
    );
}
