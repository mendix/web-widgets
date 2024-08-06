import { createElement, ReactElement, useState, ChangeEvent } from "react";
import { DialogContent, DialogHeader, DialogBody, FormControl, DialogFooter } from "./DialogContent";
import { type linkConfigType } from "../../utils/formats";

export interface LinkDialogProps {
    onSubmit(value: linkConfigType): void;
    onClose(): void;
}

export default function LinkDialog(props: LinkDialogProps): ReactElement {
    const { onSubmit, onClose } = props;
    const [formState, setFormState] = useState({
        href: "",
        title: "",
        target: "_blank"
    });

    const onInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <DialogContent className="link-dialog">
            <DialogHeader onClose={onClose}>Insert/Edit Link</DialogHeader>
            <DialogBody>
                <FormControl label="URL">
                    <input
                        type="url"
                        className="form-control"
                        name="href"
                        onChange={onInputChange}
                        value={formState.href}
                    />
                </FormControl>
                <FormControl label="Title">
                    <input type="text" className="form-control" name="title" onChange={onInputChange} />
                </FormControl>
                <FormControl label="Open link in...">
                    <select value={formState.target} name="target" onChange={onInputChange} className="form-control">
                        <option value="_self">Current window</option>
                        <option value="_blank">New window</option>
                    </select>
                </FormControl>
                <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
            </DialogBody>
        </DialogContent>
    );
}
