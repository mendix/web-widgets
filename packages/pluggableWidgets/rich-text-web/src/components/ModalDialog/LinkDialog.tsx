import { ChangeEvent, createElement, ReactElement, useState } from "react";
import classNames from "classnames";
import { type linkConfigType } from "../../utils/formats";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";

export interface LinkDialogProps {
    onSubmit(value: linkConfigType): void;
    onClose(): void;
    defaultValue?: linkConfigType;
    formOrientation?: "horizontal" | "vertical";
}

export default function LinkDialog(props: LinkDialogProps): ReactElement {
    const { onSubmit, onClose, formOrientation } = props;
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
        <DialogContent className={classNames("link-dialog", formOrientation === "vertical" ? "form-vertical" : "")}>
            <DialogHeader onClose={onClose}>Insert/Edit Link</DialogHeader>
            <DialogBody formOrientation={formOrientation}>
                <FormControl label="Text" formOrientation={formOrientation} inputId="rich-text-link-text-input">
                    <input
                        id="rich-text-link-text-input"
                        type="text"
                        className="form-control"
                        name="text"
                        onChange={onInputChange}
                        value={formState.text}
                    />
                </FormControl>
                <FormControl label="URL" formOrientation={formOrientation} inputId="rich-text-link-url-input">
                    <input
                        id="rich-text-link-url-input"
                        type="url"
                        className="form-control"
                        name="href"
                        onChange={onInputChange}
                        value={formState.href}
                    />
                </FormControl>
                <FormControl label="Title" formOrientation={formOrientation} inputId="rich-text-link-title-input">
                    <input
                        id="rich-text-link-title-input"
                        type="text"
                        className="form-control"
                        name="title"
                        onChange={onInputChange}
                        value={formState.title}
                    />
                </FormControl>
                <FormControl
                    label="Open link in..."
                    formOrientation={formOrientation}
                    inputId="rich-text-link-target-select"
                >
                    <select
                        id="rich-text-link-target-select"
                        value={formState.target}
                        name="target"
                        onChange={onInputChange}
                        className="form-control"
                    >
                        <option value="_self">Current window</option>
                        <option value="_blank">New window</option>
                    </select>
                </FormControl>
                <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
            </DialogBody>
        </DialogContent>
    );
}
