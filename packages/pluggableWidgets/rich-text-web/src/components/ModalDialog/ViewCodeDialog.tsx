import beautify from "js-beautify";
import { ReactElement, useCallback, useState } from "react";
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
    const [formState, setFormState] = useState({
        // temporarily change tab characters to em space to avoid beautify removing them
        src:
            beautify.html(currentCode?.replace(/\t/g, "&emsp;") ?? "", BEAUTIFY_OPTIONS)?.replace(/&emsp;/g, "\t") || ""
    });
    const onCodeChange = useCallback(
        (value: string) => {
            setFormState({ ...formState, src: value });
        },
        [formState]
    );

    return (
        <DialogContent className={"view-code-dialog"} formOrientation={formOrientation}>
            <DialogHeader onClose={onClose}>View/Edit Code</DialogHeader>
            <DialogBody formOrientation={props.formOrientation}>
                <div>
                    <label>Source Code</label>
                </div>
                <FormControl label="Code input" formOrientation={props.formOrientation} inputId="rich-text-code-input">
                    <textarea
                        value={formState.src}
                        onChange={e => onCodeChange(e.target.value)}
                        className="form-control mx-textarea-input mx-textarea-noresize code-input"
                        id="rich-text-code-input"
                    />
                </FormControl>
                <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
            </DialogBody>
        </DialogContent>
    );
}
