import { ChangeEvent, createElement, ReactElement, useState } from "react";
import { type linkConfigType } from "../../utils/formats";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";

export interface LinkDialogProps {
    onSubmit(value: linkConfigType): void;
    onClose(): void;
    defaultValue?: linkConfigType;
}

export default function LinkDialog(props: LinkDialogProps): ReactElement {
    const { onSubmit, onClose } = props;
    const [formState, setFormState] = useState({
        text: props.defaultValue?.text ?? "",
        href: props.defaultValue?.href ?? "",
        title: props.defaultValue?.title ?? "",
        target: props.defaultValue?.target ?? "_blank"
    });

    const onInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <DialogContent className="link-dialog">
            <DialogHeader onClose={onClose}>Insert/Edit Link</DialogHeader>
            <DialogBody>
                <FormControl label="Text">
                    <input
                        type="text"
                        className="form-control"
                        name="text"
                        onChange={onInputChange}
                        value={formState.text}
                    />
                </FormControl>
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
                    <input
                        type="text"
                        className="form-control"
                        name="title"
                        onChange={onInputChange}
                        value={formState.title}
                    />
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
