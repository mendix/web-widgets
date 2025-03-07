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
import QuillTableBetter from "../utils/formats/quill-table-better/quill-table-better";
import "../utils/formats/quill-table-better/assets/css/quill-table-better.scss";
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
                editorDiv.innerHTML = defaultValue ?? "";
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
                    : false;

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
                                ...QuillTableBetter.keyboardBindings
                            }
                        },
                        table: false,
                        "table-better": {
                            language: "en_US",
                            menus: ["column", "row", "merge", "table", "cell", "wrap", "copy", "delete"],
                            toolbarTable: true
                        },
                        toolbar
                    },
                    readOnly
                };

                const quill = new MxQuill(editorContainer, options);
                ref.current = quill;

                const html = `
                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; width:456pt">
                        <tbody>
                            <tr>
                                <td colspan="3" style="background-color:#f9e11e; height:19.25pt">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="background-color:#f9e11e; height:12.55pt; width:236.1pt">&nbsp;</td>
                                <td style="background-color:#123552; height:12.55pt; width:35.15pt">&nbsp;</td>
                                <td style="background-color:#f9e11e; height:12.55pt; width:236.1pt">&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>
                    <p></p>
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color:#efefef; border-collapse:collapse; width:456pt">
                        <tbody>
                            <tr>
                                <td>
                                <div style="margin-bottom:6pt; margin-left:0px; margin-right:0px; margin-top:0px"><span style="font-size:9px"><span style="font-family:verdana,geneva,sans-serif">Dit bericht kan informatie bevatten die niet voor u is bestemd. Indien u niet de geadresseerde bent of dit bericht abusievelijk aan u is toegezonden, wordt u verzocht dat aan de afzender te melden en het bericht te verwijderen. De Staat aanvaardt geen aansprakelijkheid voor schade, van welke aard ook, die verband houdt met risico&#39;s verbonden aan het elektronisch verzenden van berichten.</span></span></div>

                                <div style="margin-bottom:6pt; margin-left:0px; margin-right:0px; margin-top:0px"><span style="font-size:9px"><span style="font-family:verdana,geneva,sans-serif">This message may contain information that is not intended for you. If you are not the addressee or if this message was sent to you by mistake, you are requested to inform the sender and delete the message. The State accepts no liability for damage of any kind resulting from the risks inherent in the electronic transmission of messages.</span></span></div>

                                <div style="margin-bottom:0px; margin-left:0px; margin-right:0px; margin-top:6pt"><span style="font-size:9px"><span style="font-family:verdana,geneva,sans-serif">Ministerie van Infrastructuur en Waterstaat</span></span></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                `;

                const delta = quill.clipboard.convert({ html });
                quill.updateContents(delta, Quill.sources.USER);

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
