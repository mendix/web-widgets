import MarkdownIt from "markdown-it";
import { ChangeEvent, ReactNode, createElement, useEffect, useState } from "react";
import { MarkdownContainerProps } from "../typings/MarkdownProps";
import "./ui/Markdown.scss";
const mdParser = new MarkdownIt("default", {
    typographer: true
});

export function Markdown(props: MarkdownContainerProps): ReactNode {
    const { stringAttribute } = props;
    const [activeTab, setActiveTab] = useState("write");
    const [editorValue, setEditorValue] = useState(stringAttribute?.value ?? "");

    useEffect(() => {
        setEditorValue(stringAttribute?.value ?? "");
    }, [stringAttribute?.value, stringAttribute?.status]);

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        console.log(e.target.value);
        stringAttribute?.setValue(e.target.value);
    };

    const renderPreview = () => {
        return { __html: mdParser.render(stringAttribute?.value ?? "") };
    };

    return (
        <div>
            <div className="tabs">
                <button className={activeTab === "write" ? "active" : ""} onClick={() => setActiveTab("write")}>
                    Write
                </button>
                <button className={activeTab === "preview" ? "active" : ""} onClick={() => setActiveTab("preview")}>
                    Preview
                </button>
            </div>
            <div className="tab-content">
                {activeTab === "write" && (
                    <textarea
                        value={editorValue}
                        onChange={handleTextChange}
                        placeholder="Add your comment here..."
                    ></textarea>
                )}
                {activeTab === "preview" && stringAttribute?.status === "available" && (
                    <div className="preview" dangerouslySetInnerHTML={renderPreview()}></div>
                )}
            </div>
        </div>
    );
}
