import Quill, { QuillOptions, EmitterSource } from "quill";
import { createElement, MutableRefObject, forwardRef, useEffect, useRef, useLayoutEffect } from "react";
import Delta from "quill-delta";
export interface EditorProps {
    defaultValue?: string;
    onTextChange?: (...args: [delta: Delta, oldContent: Delta, source: EmitterSource]) => void;
}

// Editor is an uncontrolled React component
const Editor = forwardRef((props: EditorProps, ref: MutableRefObject<Quill | null>) => {
    const { defaultValue, onTextChange } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    // const editorRef = useRef<HTMLDivElement>(null);
    // const [canRenderEditor, setCanRenderEditor] = useState<boolean>(true);
    // const [_editorState, setEditorState] = useState<EditorState>("loading");

    const onTextChangeRef = useRef(onTextChange);
    // const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
        // onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            const editorDiv = container.ownerDocument.createElement<"div">("div");
            editorDiv.innerHTML = defaultValue ?? "";
            const editorContainer = container.appendChild(editorDiv);
            const options: QuillOptions = {
                theme: "snow"
            };
            const quill = new Quill(editorContainer, options);

            ref.current = quill;

            quill.on(Quill.events.TEXT_CHANGE, (...arg) => {
                onTextChangeRef.current?.(...arg);
            });
        }

        return () => {
            ref.current = null;
            if (container) {
                container.innerHTML = "";
            }
        };
    }, [ref]);

    return (
        <div ref={containerRef}>
            {/* {canRenderEditor && <div ref={editorRef} dangerouslySetInnerHTML={{ __html: defaultValue || "" }}></div>} */}
        </div>
    );
});

Editor.displayName = "Editor";

export default Editor;
