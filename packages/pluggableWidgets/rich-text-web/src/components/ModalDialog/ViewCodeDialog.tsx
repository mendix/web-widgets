import hljs from "highlight.js";
import beautify from "js-beautify";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";
import "highlight.js/styles/github.css";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";
import { type viewCodeConfigType } from "../../utils/formats";

export interface ViewCodeDialogProps {
    currentCode?: string;
    onSubmit(value: viewCodeConfigType): void;
    onClose(): void;
    formOrientation: "horizontal" | "vertical";
}

const BEAUTIFY_OPTIONS: beautify.HTMLBeautifyOptions = {
    indent_size: 4,
    indent_char: " ",
    max_preserve_newlines: 5,
    preserve_newlines: true,
    indent_scripts: "normal",
    end_with_newline: false,
    wrap_line_length: 0,
    indent_inner_html: false,
    indent_empty_lines: false
};

export default function ViewCodeDialog(props: ViewCodeDialogProps): ReactElement {
    const { onSubmit, onClose, currentCode, formOrientation } = props;
    const codeRef = useRef<HTMLElement>(null);
    const [formState, setFormState] = useState({
        // temporarily change tab characters to em space to avoid beautify removing them
        src:
            beautify.html(currentCode?.replace(/\t/g, "&emsp;") ?? "", BEAUTIFY_OPTIONS)?.replace(/&emsp;/g, "\t") || ""
    });

    useEffect(() => {
        const codeElement = codeRef.current;
        if (codeElement) {
            hljs.highlightElement(codeElement);
        }
        return () => {
            if (codeElement) {
                delete codeElement.dataset.highlighted;
            }
        };
    }, [formState]);

    const onCodeChange = useCallback((value: string) => {
        setFormState({ src: value });
    }, []);

    return (
        <DialogContent className={"view-code-dialog"} formOrientation={formOrientation}>
            <DialogHeader onClose={onClose}>View/Edit Code</DialogHeader>
            <DialogBody formOrientation={props.formOrientation}>
                <div>
                    <label>Source Code</label>
                </div>
                <FormControl label="Code input" formOrientation={props.formOrientation} inputId="rich-text-code-input">
                    <ScrollSync>
                        <div className="code-editor-container">
                            <ScrollSyncPane>
                                <textarea
                                    spellCheck={false}
                                    value={formState.src}
                                    id="rich-text-code-input-buffer"
                                    disabled
                                    className="code-editor code-buffer"
                                />
                            </ScrollSyncPane>
                            <ScrollSyncPane>
                                <textarea
                                    spellCheck={false}
                                    value={formState.src}
                                    onChange={e => onCodeChange(e.target.value)}
                                    className="code-input code-editor"
                                    id="rich-text-code-input"
                                />
                            </ScrollSyncPane>
                            <ScrollSyncPane>
                                <pre className="code-preview code-editor" aria-hidden="true">
                                    <code ref={codeRef} className="language-html">
                                        {formState.src}
                                    </code>
                                </pre>
                            </ScrollSyncPane>
                        </div>
                    </ScrollSync>
                </FormControl>
                <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
            </DialogBody>
        </DialogContent>
    );
}
