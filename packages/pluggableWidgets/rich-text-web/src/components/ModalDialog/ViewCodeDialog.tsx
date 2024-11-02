import { ChangeEvent, createElement, ReactElement, useState } from "react";
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

    const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <DialogContent className="view-code-dialog">
            <DialogHeader onClose={onClose}>View/Edit Code</DialogHeader>
            <DialogBody>
                <FormControl label="Source Code">
                    <textarea
                        name="src"
                        className="form-control mx-textarea-input mx-textarea-noresize code-input"
                        onChange={onInputChange}
                        value={formState.src}
                    ></textarea>
                </FormControl>
                <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
            </DialogBody>
        </DialogContent>
    );
}
