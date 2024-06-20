import Quill, { QuillOptions, EmitterSource, Range } from "quill";
import { createElement, MutableRefObject, forwardRef, useEffect, useRef, useLayoutEffect, CSSProperties } from "react";
import Delta from "quill-delta";
export interface EditorProps {
    defaultValue?: string;
    onTextChange?: (...args: [delta: Delta, oldContent: Delta, source: EmitterSource]) => void;
    onSelectionChange?: (...args: [range: Range, oldRange: Range, source: EmitterSource]) => void;
    theme: string;
    style?: CSSProperties;
    className?: string;
    toolbarId?: string;
    readOnly?: boolean;
}

// Editor is an uncontrolled React component
const Editor = forwardRef((props: EditorProps, ref: MutableRefObject<Quill | null>) => {
    const { theme, defaultValue, style, className, toolbarId, onTextChange, onSelectionChange, readOnly } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
        onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    useEffect(() => {
        // update quills content on value change.
        const newContent = ref.current?.clipboard.convert({
            html: defaultValue,
            text: "\n"
        });
        if (newContent) {
            ref.current?.setContents(newContent);
        }
    }, [ref, defaultValue]);

    useEffect(
        () => {
            const container = containerRef.current;
            if (container) {
                const editorDiv = container.ownerDocument.createElement<"div">("div");
                editorDiv.innerHTML = defaultValue ?? "";
                const editorContainer = container.appendChild(editorDiv);
                const options: QuillOptions = {
                    theme,
                    modules: {
                        toolbar: toolbarId ? `#${toolbarId}` : false
                    },
                    readOnly
                };
                const quill = new Quill(editorContainer, options);

                ref.current = quill;

                quill.on(Quill.events.TEXT_CHANGE, (...arg) => {
                    onTextChangeRef.current?.(...arg);
                });

                quill.on(Quill.events.SELECTION_CHANGE, (...arg) => {
                    onSelectionChangeRef.current?.(...arg);
                });
            }

            return () => {
                ref.current = null;
                if (container) {
                    container.innerHTML = "";
                }
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ref]
    );

    return <div ref={containerRef} style={style} className={className}></div>;
});

Editor.displayName = "Editor";

export default Editor;
