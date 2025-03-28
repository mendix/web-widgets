import { ChangeEvent, createElement, ReactElement, useEffect, useRef, useState } from "react";
import { type imageConfigType } from "../../utils/formats";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";
import { IMG_MIME_TYPES } from "../CustomToolbars/constants";

export interface ImageDialogProps {
    onSubmit(value: imageConfigType): void;
    onClose(): void;
    defaultValue?: imageConfigType;
}

export default function ImageDialog(props: ImageDialogProps): ReactElement {
    const { onSubmit, onClose, defaultValue } = props;
    const inputReference = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => inputReference?.current?.focus(), 50);
    }, []);

    const [formState, setFormState] = useState<imageConfigType>({
        files: null,
        alt: defaultValue?.alt ?? "",
        width: defaultValue?.width ?? 100,
        height: defaultValue?.height ?? 100,
        src: defaultValue?.src ?? undefined
    });

    const onFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.files });
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <DialogContent className="image-dialog">
            <DialogHeader onClose={onClose}>Insert/Edit Image</DialogHeader>
            <DialogBody>
                <FormControl label="Source">
                    {defaultValue?.src ? (
                        <img src={defaultValue.src} alt={defaultValue.alt} height={50} />
                    ) : (
                        <input
                            name="files"
                            className="form-control mx-textarea-input mx-textarea-noresize code-input"
                            type="file"
                            accept={IMG_MIME_TYPES.join(", ")}
                            onChange={onFileChange}
                        ></input>
                    )}
                </FormControl>
                <FormControl label="Alternative description">
                    <input
                        className="form-control"
                        type="text"
                        name="alt"
                        onChange={onInputChange}
                        value={formState.alt}
                        ref={inputReference}
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
