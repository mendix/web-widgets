import Quill, { QuillOptions, EmitterSource, Range } from "quill";
import CustomListItem from "../utils/formats/customList";
import CustomLink from "../utils/formats/link";
import CustomVideo from "../utils/formats/video";

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
import "../utils/formats/fonts";
import Dialog from "./ModalDialog/Dialog";
// import {type LinkFormType} from "./ModalDialog/LinkDialog";
import { useEmbedModal } from "./CustomToolbars/useEmbedModal";

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

Quill.register(CustomListItem, true);
Quill.register(CustomLink, true);
Quill.register(CustomVideo, true);

// Editor is an uncontrolled React component
const Editor = forwardRef((props: EditorProps, ref: MutableRefObject<Quill | null>) => {
    const { theme, defaultValue, style, className, toolbarId, onTextChange, onSelectionChange, readOnly } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const { showDialog, setShowDialog, dialogConfig, customLinkHandler, customVideoHandler } = useEmbedModal(ref);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

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
                        toolbar: toolbarId
                            ? {
                                  container: Array.isArray(toolbarId) ? toolbarId : `#${toolbarId}`,
                                  handlers: {
                                      link: customLinkHandler,
                                      video: customVideoHandler
                                  }
                              }
                            : false
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
        [ref, toolbarId]
    );

    return (
        <Fragment>
            <div ref={containerRef} style={style} className={className}></div>
            <div ref={modalRef}></div>
            <Dialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                parentNode={modalRef.current?.ownerDocument.body}
                {...dialogConfig}
            ></Dialog>
        </Fragment>
    );
});

Editor.displayName = "Editor";

export default Editor;
