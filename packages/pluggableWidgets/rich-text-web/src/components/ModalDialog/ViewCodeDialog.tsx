import { html } from "@codemirror/lang-html";
import { githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { createElement, ReactElement, useMemo, useState } from "react";
import { type viewCodeConfigType } from "../../utils/formats";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";

export interface ViewCodeDialogProps {
    currentCode?: string;
    onSubmit(value: viewCodeConfigType): void;
    onClose(): void;
}

export default function ViewCodeDialog(props: ViewCodeDialogProps): ReactElement {
    const { onSubmit, onClose, currentCode } = props;
    const [formState, setFormState] = useState({
        src: currentCode || ""
    });

    const extensions = useMemo<Extension[]>(() => [html(), EditorView.lineWrapping], []);

    const onCodeChange = (value: string): void => {
        setFormState({ ...formState, src: value });
    };

    return (
        <DialogContent className="view-code-dialog">
            <DialogHeader onClose={onClose}>View/Edit Code</DialogHeader>
            <DialogBody>
                <FormControl label="Source Code">
                    <CodeMirror
                        className="form-control mx-textarea-input mx-textarea-noresize code-input"
                        value={formState.src}
                        onChange={onCodeChange}
                        theme={githubLight}
                        extensions={extensions}
                        maxWidth="600px"
                    />
                </FormControl>
                <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
            </DialogBody>
        </DialogContent>
    );
}
