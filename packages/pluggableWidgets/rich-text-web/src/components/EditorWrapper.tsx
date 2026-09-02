import classNames from "classnames";
import { ReactElement, useRef, useState, useEffect } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";
import { useDebounceWithStatus } from "@mendix/widget-plugin-hooks/useDebounceWithStatus";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import Editor, { EditorHandle } from "./Editor";
import { StatusBar, StatusBarMetricType } from "./StatusBar";
import { constructWrapperStyle } from "../utils/helpers";

export interface EditorWrapperProps extends RichTextContainerProps {
    className?: string;
}

function EditorWrapper(props: EditorWrapperProps): ReactElement {
    const {
        stringAttribute,
        className,
        styleDataFormat,
        imageSource,
        imageSourceContent,
        enableDefaultUpload,
        dialogStyle,
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
        helpButton,
        advancedConfig,
        enableStatusBar,
        statusBarContent,
        customFonts,
        toolbarLocation,
        readOnlyStyle,
        onFocus,
        onBlur,
        onLoad,
        onChangeType,
        onChange
    } = props;
    const editorRef = useRef<EditorHandle>(null);
    const [editorText, setEditorText] = useState<string>("");
    const wrapperStyle = constructWrapperStyle(props);

    const normalizeEmpty = (value?: string): string => {
        if (!value || value === "<p></p>") return "";
        return value;
    };

    const [setAttributeValueDebounce] = useDebounceWithStatus(
        (html?: string) => {
            const current = normalizeEmpty(stringAttribute.value);
            const incoming = normalizeEmpty(html);

            if (current !== incoming) {
                stringAttribute.setValue(incoming);

                if (onChangeType === "onDataChange") {
                    executeAction(onChange);
                }
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
        <div
            className={classNames(className, `toolbar-${toolbarLocation}`, {
                [`widget-rich-text-readonly-${readOnlyStyle}`]: stringAttribute.readOnly
            })}
            style={{ width: wrapperStyle?.width }}
        >
            {stringAttribute.status === "available" && (
                <>
                    <Editor
                        ref={editorRef}
                        defaultValue={stringAttribute.value}
                        readOnly={stringAttribute.readOnly}
                        className="tiptap-editor"
                        style={wrapperStyle}
                        styleDataFormat={styleDataFormat}
                        imageSource={imageSource}
                        imageSourceContent={imageSourceContent}
                        enableDefaultUpload={enableDefaultUpload}
                        dialogStyle={dialogStyle}
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
                        helpButton={helpButton}
                        advancedConfig={advancedConfig}
                        customFonts={customFonts}
                        toolbarLocation={
                            stringAttribute.readOnly && readOnlyStyle !== "text" ? "hide" : toolbarLocation
                        }
                        onUpdate={handleUpdate}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onLoad={onLoad}
                        onChange={onChange}
                        onChangeType={onChangeType}
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
