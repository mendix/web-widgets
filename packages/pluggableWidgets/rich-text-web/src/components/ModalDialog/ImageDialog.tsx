import { If } from "@mendix/widget-plugin-component-kit/If";
import classNames from "classnames";
import { ChangeEvent, createElement, ReactElement, useEffect, useRef, useState } from "react";
import { RichTextContainerProps } from "../../../typings/RichTextProps";
import { type imageConfigType } from "../../utils/formats";
import { IMG_MIME_TYPES } from "../CustomToolbars/constants";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";

type imageListType = {
    id: string;
    url: string;
    thumbnailUrl?: string;
};

interface CustomEvent<T = any> extends Event {
    /**
     * Returns any custom data event was created with. Typically used for synthetic events.
     */
    readonly detail: T;
    initCustomEvent(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, detailArg: T): void;
}

export interface ImageDialogProps extends Pick<RichTextContainerProps, "imageSource" | "imageSourceContent"> {
    onSubmit(value: imageConfigType): void;
    onClose(): void;
    defaultValue?: imageConfigType;
    enableDefaultUpload?: boolean;
}

export default function ImageDialog(props: ImageDialogProps): ReactElement {
    const { onClose, defaultValue, onSubmit, imageSource, imageSourceContent, enableDefaultUpload } = props;
    const [activeTab, setActiveTab] = useState("general");
    const [selectedImageEntity, setSelectedImageEntity] = useState<imageListType>();
    const imageUploadElementRef = useRef<HTMLDivElement>(null);
    // disable embed tab if it is about modifying current video
    const disableEmbed =
        (defaultValue?.src && defaultValue.src.length > 0) ||
        imageSource === undefined ||
        imageSource?.status !== "available";

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

    const onEmbedSelected = (image: imageListType): void => {
        setFormState({ ...formState, entityGuid: image.id, src: undefined, files: null });
        setSelectedImageEntity(image);
        setActiveTab("general");
    };

    const handleImageSelected = (event: CustomEvent<imageListType>): void => {
        const image = event.detail;
        onEmbedSelected(image);
    };

    const onEmbedDeleted = (): void => {
        setFormState({ ...formState, entityGuid: undefined, src: undefined });
        setSelectedImageEntity(undefined);
    };

    useEffect(() => {
        const imgRef = imageUploadElementRef.current;

        // const element = ref.current;
        if (imgRef !== null) {
            imgRef.addEventListener("imageSelected", handleImageSelected);
        }
        // element.addEventListener("click", handleClick);

        return () => {
            imgRef?.removeEventListener("imageSelected", handleImageSelected);
        };
    }, [imageUploadElementRef.current]);

    return (
        <DialogContent className="video-dialog">
            <DialogHeader onClose={onClose}>{activeTab === "general" ? "Insert/Edit" : "Embed"} Images</DialogHeader>
            <DialogBody>
                {!disableEmbed && (
                    <div>
                        <ul className="nav nav-tabs mx-tabcontainer-tabs" role="tablist">
                            <li
                                role="presentation"
                                className={classNames({
                                    active: activeTab === "general"
                                })}
                                onClick={() => setActiveTab("general")}
                            >
                                <a href="#">General</a>
                            </li>
                            <li
                                role="presentation"
                                className={classNames({
                                    active: activeTab === "embed"
                                })}
                                onClick={(e: React.MouseEvent) => {
                                    setActiveTab("embed");
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            >
                                <a href="#">Attachments</a>
                            </li>
                        </ul>
                    </div>
                )}
                <div ref={imageUploadElementRef}>
                    <If condition={activeTab === "general"}>
                        <FormControl label="Source">
                            {defaultValue?.src ? (
                                <img
                                    src={defaultValue.src}
                                    alt={defaultValue.alt}
                                    className="mx-image-dialog-thumbnail-small"
                                />
                            ) : formState.entityGuid && selectedImageEntity ? (
                                <div className="mx-image-dialog-thumbnail-container">
                                    <img
                                        src={selectedImageEntity.thumbnailUrl || selectedImageEntity.url}
                                        alt={selectedImageEntity.id}
                                        className="mx-image-dialog-thumbnail-small"
                                    />
                                    <span className="icon-container">
                                        <span className="icons icon-Delete" onClick={onEmbedDeleted}></span>
                                    </span>
                                </div>
                            ) : enableDefaultUpload ? (
                                <input
                                    name="files"
                                    className="form-control mx-textarea-input mx-textarea-noresize code-input"
                                    type="file"
                                    accept={IMG_MIME_TYPES.join(", ")}
                                    onChange={onFileChange}
                                ></input>
                            ) : undefined}
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
                    </If>
                    <If condition={activeTab === "embed"}>
                        <div>{imageSourceContent}</div>
                    </If>
                </div>
            </DialogBody>
        </DialogContent>
    );
}
