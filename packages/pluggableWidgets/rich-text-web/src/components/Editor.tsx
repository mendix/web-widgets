import Quill, { QuillOptions, EmitterSource, Range } from "quill";
import {
    createElement,
    MutableRefObject,
    forwardRef,
    useEffect,
    // useState,
    useRef,
    useLayoutEffect,
    CSSProperties,
    Fragment
} from "react";
import Delta from "quill-delta";
import Dialog from "./ModalDialog/Dialog";
import "../utils/customPluginRegisters";
import { useEmbedModal } from "./CustomToolbars/useEmbedModal";
import { getIndentHandler, enterKeyKeyboardHandler } from "./CustomToolbars/toolbarHandlers";
import MxQuill from "../utils/MxQuill";

export interface EditorProps {
    defaultValue?: string;
    onTextChange?: (...args: [delta: Delta, oldContent: Delta, source: EmitterSource]) => void;
    onSelectionChange?: (...args: [range: Range, oldRange: Range, source: EmitterSource]) => void;
    theme: string;
    style?: CSSProperties;
    className?: string;
    toolbarId?: string | Array<string | string[] | { [k: string]: any }>;
    readOnly?: boolean;
}

// Editor is an uncontrolled React component
const Editor = forwardRef((props: EditorProps, ref: MutableRefObject<Quill | null>) => {
    const { theme, defaultValue, style, className, toolbarId, onTextChange, onSelectionChange, readOnly } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    const { showDialog, setShowDialog, dialogConfig, customLinkHandler, customVideoHandler, customViewCodeHandler } =
        useEmbedModal(ref);
    const customIndentHandler = getIndentHandler(ref);

    // quill instance is not changing, thus, the function reference has to stays.
    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
        onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    // update quills content on value change.
    useEffect(() => {
        const newContent = ref.current?.clipboard.convert({
            html: defaultValue,
            text: "\n"
        });
        if (newContent) {
            ref.current?.setContents(newContent);
        }
    }, [ref, defaultValue]);

    // use effect for constructing Quill instance
    useEffect(
        () => {
            const container = containerRef.current;
            if (container) {
                const editorDiv = container.ownerDocument.createElement<"div">("div");
                editorDiv.innerHTML = defaultValue ?? "";
                const editorContainer = container.appendChild(editorDiv);

                // Quill instance configurations.
                const options: QuillOptions = {
                    theme,
                    modules: {
                        keyboard: {
                            bindings: {
                                enter: {
                                    key: "Enter",
                                    handler: enterKeyKeyboardHandler
                                }
                            }
                        },
                        toolbar: toolbarId
                            ? {
                                  container: Array.isArray(toolbarId) ? toolbarId : `#${toolbarId}`,
                                  handlers: {
                                      link: customLinkHandler,
                                      video: customVideoHandler,
                                      indent: customIndentHandler,
                                      "view-code": customViewCodeHandler
                                  }
                              }
                            : false
                    },
                    readOnly
                };
                const quill = new MxQuill(editorContainer, options);
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
        [ref, toolbarId]
    );

    return (
        <Fragment>
            <div ref={containerRef} style={style} className={className}></div>
            <div ref={modalRef}></div>
            <Dialog
                isOpen={showDialog}
                onOpenChange={open => setShowDialog(open)}
                parentNode={modalRef.current?.ownerDocument.body}
                {...dialogConfig}
            ></Dialog>
        </Fragment>
    );
});

Editor.displayName = "Editor";

export default Editor;
