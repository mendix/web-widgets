import Quill, { EmitterSource, QuillOptions, Range } from "quill";
import Delta from "quill-delta";
import {
    createElement,
    CSSProperties,
    forwardRef,
    Fragment,
    MutableRefObject,
    useEffect,
    useLayoutEffect,
    // useState,
    useRef
} from "react";
import "../utils/customPluginRegisters";
import MxQuill from "../utils/MxQuill";
import {
    enterKeyKeyboardHandler,
    getIndentHandler,
    gotoStatusBarKeyboardHandler,
    gotoToolbarKeyboardHandler
} from "./CustomToolbars/toolbarHandlers";
import { useEmbedModal } from "./CustomToolbars/useEmbedModal";
import Dialog from "./ModalDialog/Dialog";

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

    const {
        showDialog,
        setShowDialog,
        dialogConfig,
        customLinkHandler,
        customVideoHandler,
        customViewCodeHandler,
        customImageUploadHandler
    } = useEmbedModal(ref);
    const customIndentHandler = getIndentHandler(ref);

    // quill instance is not changing, thus, the function reference has to stays.
    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
        onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    // update quills content on value change.
    useEffect(() => {
        // if there is an update comes from external element
        if (!ref.current?.hasFocus()) {
            const newContent = ref.current?.clipboard.convert({
                html: defaultValue
            });
            if (newContent && newContent !== ref.current?.getContents()) {
                ref.current?.setContents(newContent);
            }
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
                                },
                                focusTab: {
                                    key: "F10",
                                    altKey: true,
                                    handler: gotoToolbarKeyboardHandler
                                },
                                tab: {
                                    key: "Tab",
                                    handler: gotoStatusBarKeyboardHandler
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
                                      "view-code": customViewCodeHandler,
                                      image: customImageUploadHandler
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
                quill.on("EDIT-TOOLTIP", (...arg: any[]) => {
                    customLinkHandler(arg[0]);
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
