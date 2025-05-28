import Quill, { EmitterSource, QuillOptions, Range } from "quill";
import Delta from "quill-delta";
import {
    createElement,
    CSSProperties,
    forwardRef,
    Fragment,
    MutableRefObject,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef
} from "react";
import { CustomFontsType } from "../../typings/RichTextProps";
import { EditorDispatchContext } from "../store/EditorProvider";
import { SET_FULLSCREEN_ACTION } from "../store/store";
import "../utils/customPluginRegisters";
import { FontStyleAttributor, formatCustomFonts } from "../utils/formats/fonts";
import "../utils/formats/quill-table-better/assets/css/quill-table-better.scss";
import QuillTableBetter from "../utils/formats/quill-table-better/quill-table-better";
import { RESIZE_MODULE_CONFIG } from "../utils/formats/resizeModuleConfig";
import { ACTION_DISPATCHER } from "../utils/helpers";
import MxQuill from "../utils/MxQuill";
import {
    enterKeyKeyboardHandler,
    exitFullscreenKeyboardHandler,
    getIndentHandler,
    gotoStatusBarKeyboardHandler,
    gotoToolbarKeyboardHandler
} from "./CustomToolbars/toolbarHandlers";
import { useEmbedModal } from "./CustomToolbars/useEmbedModal";
import Dialog from "./ModalDialog/Dialog";

export interface EditorProps {
    customFonts: CustomFontsType[];
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
    const fonts = formatCustomFonts(props.customFonts);
    const FontStyle = new FontStyleAttributor(fonts);
    Quill.register(FontStyle, true);
    const { theme, defaultValue, style, className, toolbarId, onTextChange, onSelectionChange, readOnly } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const contextDispatch = useContext(EditorDispatchContext);

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
        if (!ref.current?.hasFocus() && defaultValue !== ref.current?.getSemanticHTML()) {
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
                const editorContainer = container.appendChild(editorDiv);

                const toolbar = toolbarId
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
                    : // we cannot set toolbar to false, because "table-better" needs toolbar module
                      // hidden toolbar will be set with display: none
                      [];

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
                                },
                                escape: {
                                    key: "Escape",
                                    handler: exitFullscreenKeyboardHandler
                                },
                                ...QuillTableBetter.keyboardBindings
                            }
                        },
                        table: false,
                        "table-better": {
                            language: "en_US",
                            menus: ["column", "row", "merge", "table", "cell", "wrap", "copy", "delete", "grid"],
                            toolbarTable: !readOnly
                        },
                        toolbar
                    },
                    readOnly
                };

                if (!readOnly && options.modules) {
                    options.modules.resize = RESIZE_MODULE_CONFIG;
                }
                const quill = new MxQuill(editorContainer, options);
                ref.current = quill;

                const delta = quill.clipboard.convert({ html: defaultValue ?? "" });
                quill.updateContents(delta, Quill.sources.SILENT);

                quill.on(Quill.events.TEXT_CHANGE, (...arg) => {
                    onTextChangeRef.current?.(...arg);
                });
                quill.on(Quill.events.SELECTION_CHANGE, (...arg) => {
                    onSelectionChangeRef.current?.(...arg);
                });
                quill.on(ACTION_DISPATCHER, (...arg: any[]) => {
                    if (arg[0]) {
                        if (arg[0].href) {
                            customLinkHandler(arg[0]);
                        } else if (arg[0].src) {
                            if (arg[0].type === "video") {
                                customVideoHandler(arg[0]);
                            } else {
                                customImageUploadHandler(arg[0]);
                            }
                        } else if (arg[0].type) {
                            if (arg[0].type === SET_FULLSCREEN_ACTION) {
                                if (contextDispatch) {
                                    contextDispatch(arg[0]);
                                }
                            }
                        }
                    }
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
