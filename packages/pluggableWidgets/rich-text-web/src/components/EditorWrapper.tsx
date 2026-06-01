import { ReactElement, useRef, useState, useEffect } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";
import { useDebounceWithStatus } from "@mendix/widget-plugin-hooks/useDebounceWithStatus";
import Editor, { EditorHandle } from "./Editor";
import { StatusBar, StatusBarMetricType } from "./StatusBar";

export interface EditorWrapperProps extends RichTextContainerProps {
    className?: string;
}

function EditorWrapper(props: EditorWrapperProps): ReactElement {
    const {
        stringAttribute,
        className,
        styleDataFormat,
        imageSourceContent,
        preset,
        toolbarConfig,
        history,
        fontStyle,
        fontScript,
        list,
        indent,
        embed,
        align,
        code,
        fontColor,
        header,
        view,
        remove,
        tableBetter,
        advancedConfig,
        enableStatusBar,
        statusBarContent
    } = props;
    const editorRef = useRef<EditorHandle>(null);
    const [editorText, setEditorText] = useState<string>("");

    const [setAttributeValueDebounce] = useDebounceWithStatus(
        (html?: string) => {
            if (stringAttribute.value !== html) {
                stringAttribute.setValue(html);
            }
        },
        200,
        false
    );

    const handleUpdate = (html: string): void => {
        if (stringAttribute.value !== html) {
            setAttributeValueDebounce(html);
        }
    };

    // Update editor text for status bar when editor content changes
    useEffect(() => {
        if (editorRef.current && enableStatusBar) {
            const text = editorRef.current.getText();
            setEditorText(text);
        }
    }, [stringAttribute.value, enableStatusBar]);

    // Determine status bar content based on metric type
    const statusBarContentValue = (() => {
        if (!enableStatusBar) return "";

        switch (statusBarContent) {
            case "wordCount":
            case "characterCount":
                return editorText;
            case "characterCountHtml":
                return stringAttribute.value || "";
            default:
                return editorText;
        }
    })();

    return (
        <div className={className}>
            {stringAttribute.status === "available" && (
                <>
                    <Editor
                        ref={editorRef}
                        defaultValue={stringAttribute.value}
                        onUpdate={handleUpdate}
                        readOnly={stringAttribute.readOnly}
                        className="tiptap-editor"
                        styleDataFormat={styleDataFormat}
                        imageSourceContent={imageSourceContent}
                        preset={preset}
                        toolbarConfig={toolbarConfig}
                        toolbarGroups={{
                            history,
                            fontStyle,
                            fontScript,
                            list,
                            indent,
                            embed,
                            align,
                            code,
                            fontColor,
                            header,
                            view,
                            remove,
                            tableBetter
                        }}
                        advancedConfig={advancedConfig}
                    />
                    {enableStatusBar && (
                        <StatusBar
                            content={statusBarContentValue}
                            metricType={statusBarContent as StatusBarMetricType}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default EditorWrapper;
