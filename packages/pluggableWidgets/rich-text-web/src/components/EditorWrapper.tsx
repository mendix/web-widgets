import { ReactElement, useRef } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";
import { useDebounceWithStatus } from "@mendix/widget-plugin-hooks/useDebounceWithStatus";
import Editor, { EditorHandle } from "./Editor";

export interface EditorWrapperProps extends RichTextContainerProps {
    className?: string;
}

function EditorWrapper(props: EditorWrapperProps): ReactElement {
    const { stringAttribute, className, styleDataFormat, imageSourceContent } = props;
    const editorRef = useRef<EditorHandle>(null);

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

    return (
        <div className={className}>
            {stringAttribute.status === "available" && (
                <Editor
                    ref={editorRef}
                    defaultValue={stringAttribute.value}
                    onUpdate={handleUpdate}
                    readOnly={stringAttribute.readOnly}
                    className="tiptap-editor"
                    styleDataFormat={styleDataFormat}
                    imageSourceContent={imageSourceContent}
                />
            )}
        </div>
    );
}

export default EditorWrapper;
