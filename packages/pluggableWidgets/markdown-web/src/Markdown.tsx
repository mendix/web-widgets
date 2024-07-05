import MarkdownIt from "markdown-it";
import { ChangeEvent, ReactNode, createElement, useState, useRef, useEffect } from "react";
import { MarkdownContainerProps } from "../typings/MarkdownProps";
import "./ui/Markdown.scss";
import classNames from "classnames";
const mdParser = new MarkdownIt("default", {
    typographer: true,
    linkify: true
});

export function Markdown(props: MarkdownContainerProps): ReactNode {
    const { stringAttribute } = props;
    const [activeTab, setActiveTab] = useState("write");
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.innerHTML = mdParser.render(stringAttribute.value ?? "");
        }
    }, [stringAttribute?.value, stringAttribute?.status, activeTab]);

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        stringAttribute?.setValue(e.target.value);
    };

    return (
        <div className="widget-markdown">
            <div className="widget-markdown-topbar">
                <button
                    className={classNames("widget-markdown-topbar-write-button", { active: activeTab === "write" })}
                    onClick={() => setActiveTab("write")}
                >
                    Write
                </button>
                <button
                    className={classNames("widget-markdown-topbar-preview-button", {
                        active: activeTab === "preview"
                    })}
                    onClick={() => setActiveTab("preview")}
                >
                    Preview
                </button>
            </div>
            <div className="widget-markdown-content">
                {activeTab === "write" && (
                    <textarea
                        className="widget-markdown-content-textarea"
                        value={stringAttribute.value ?? ""}
                        onChange={handleTextChange}
                        placeholder="Add your comment here..."
                    ></textarea>
                )}
                {activeTab === "preview" && stringAttribute?.status === "available" && (
                    <div className="widget-markdown-content-preview" ref={previewRef}></div>
                )}
            </div>
            <div className="widget-markdown-footer">
                <div className="info">Markdown is supported</div>
                <div className="line"></div>
                <div className="info">Paste, drop or click to add files.</div>
            </div>
        </div>
    );
}
