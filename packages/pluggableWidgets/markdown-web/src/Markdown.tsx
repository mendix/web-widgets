import MarkdownIt from "markdown-it";
import { ReactNode, createElement, useRef, useEffect } from "react";
import { MarkdownContainerProps } from "../typings/MarkdownProps";
import "./ui/Markdown.scss";
const mdParser = new MarkdownIt("default", {
    typographer: true,
    linkify: true
});

export function Markdown(props: MarkdownContainerProps): ReactNode {
    const { stringAttribute } = props;
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.innerHTML = mdParser.render(stringAttribute.value ?? "");
        }
    }, [stringAttribute?.value, stringAttribute?.status]);

    return (
        <div className="widget-markdown">
            {stringAttribute?.status === "available" && (
                <div className="widget-markdown-content" ref={previewRef}></div>
            )}
        </div>
    );
}
