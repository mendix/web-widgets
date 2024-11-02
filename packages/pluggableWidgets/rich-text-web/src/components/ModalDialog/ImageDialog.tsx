import { ChangeEvent, createElement, ReactElement, useState } from "react";
import { type imageConfigType } from "../../utils/formats";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";
import { IMG_MIME_TYPES } from "../CustomToolbars/constants";

export interface ImageDialogProps {
    onSubmit(value: imageConfigType): void;
    onClose(): void;
}

export default function ImageDialog(props: ImageDialogProps): ReactElement {
    const { onSubmit, onClose } = props;

    const [formState, setFormState] = useState<imageConfigType>({
        files: null,
        width: 100,
        height: 100
    });

    const onFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.files });
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <DialogContent className="image-dialog">
            <DialogHeader onClose={onClose}>Insert/Edit Image</DialogHeader>
            <DialogBody>
                <FormControl label="Source Code">
                    <input
                        name="files"
                        className="form-control mx-textarea-input mx-textarea-noresize code-input"
                        type="file"
                        accept={IMG_MIME_TYPES.join(", ")}
                        onChange={onFileChange}
                    ></input>
                </FormControl>
                <FormControl label="Alternative description">
                    <input
                        className="form-control"
                        type="text"
                        name="alt"
                        onChange={onInputChange}
                        value={formState.alt}
                    />
                </FormControl>
                <FormControl label="Width">
                    <input
                        className="form-control"
                        type="number"
                        name="width"
                        onChange={onInputChange}
                        value={formState.width}
                    />
                    px
                </FormControl>
                <FormControl label="Height">
                    <input
                        className="form-control"
                        type="number"
                        name="height"
                        onChange={onInputChange}
                        value={formState.height}
                    />
                    px
                </FormControl>
                <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
            </DialogBody>
        </DialogContent>
    );
}
