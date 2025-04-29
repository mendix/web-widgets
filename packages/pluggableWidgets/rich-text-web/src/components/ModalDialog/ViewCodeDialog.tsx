import { createElement, ReactElement, useState, useCallback } from "react";
import { type viewCodeConfigType } from "../../utils/formats";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "codemirror";
import beautify from "js-beautify";

export interface ViewCodeDialogProps {
    currentCode?: string;
    onSubmit(value: viewCodeConfigType): void;
    onClose(): void;
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
    const { onSubmit, onClose, currentCode } = props;
    const [formState, setFormState] = useState({
        src: beautify.html(currentCode ?? "", BEAUTIFY_OPTIONS) || ""
    });
    const onCodeChange = useCallback((value: string, _viewUpdate: ViewUpdate) => {
        setFormState({ ...formState, src: value });
    }, []);

    return (
        <DialogContent className="view-code-dialog">
            <DialogHeader onClose={onClose}>View/Edit Code</DialogHeader>
            <DialogBody>
                <div>
                    <label>Source Code</label>
                </div>
                <FormControl>
                    <CodeMirror
                        className="form-control mx-textarea-input mx-textarea-noresize code-input"
                        value={formState.src}
                        extensions={[EditorView.lineWrapping, html()]}
                        onChange={onCodeChange}
                        basicSetup
                        theme={githubLight}
                        maxHeight="70vh"
                    />
                </FormControl>
                <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
            </DialogBody>
        </DialogContent>
    );
}
