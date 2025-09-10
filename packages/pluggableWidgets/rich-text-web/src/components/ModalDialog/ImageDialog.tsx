import { If } from "@mendix/widget-plugin-component-kit/If";
import classNames from "classnames";
import { ChangeEvent, createElement, ReactElement, SyntheticEvent, useEffect, useRef, useState } from "react";
import { RichTextContainerProps } from "../../../typings/RichTextProps";
import { type imageConfigType } from "../../utils/formats";
import { IMG_MIME_TYPES } from "../CustomToolbars/constants";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";

type Image = {
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

export interface ImageDialogProps
    extends Pick<RichTextContainerProps, "imageSource" | "imageSourceContent" | "formOrientation"> {
    onSubmit(value: imageConfigType): void;
    onClose(): void;
    defaultValue?: imageConfigType;
    enableDefaultUpload?: boolean;
}

export default function ImageDialog(props: ImageDialogProps): ReactElement {
    const { onClose, defaultValue, onSubmit, imageSource, imageSourceContent, enableDefaultUpload, formOrientation } =
        props;
    const [activeTab, setActiveTab] = useState("general");
    const [selectedImageEntity, setSelectedImageEntity] = useState<Image>();
    const imageUploadElementRef = useRef<HTMLDivElement>(null);
    // disable embed tab if it is about modifying current video
    const disableEmbed =
        (defaultValue?.src && defaultValue.src.length > 0) ||
        imageSource === undefined ||
        imageSource?.status !== "available";

    const inputReference = useRef<HTMLInputElement>(null);
    const isInputProcessed = useRef(false);
    useEffect(() => {
        setTimeout(() => inputReference?.current?.focus(), 50);
        if (
            !disableEmbed &&
            imageSource &&
            imageSource.status === "available" &&
            defaultValue?.files &&
            !isInputProcessed.current
        ) {
            // if there is a file given, and imageSource is available
            // assume that we want to do image upload to entity
            // and switch to embed tab
            setActiveTab("embed");
        }
    }, [defaultValue?.files, disableEmbed, imageSource]);

    useEffect(() => {
        if (activeTab === "embed" && defaultValue?.files && !isInputProcessed.current) {
            // upload image directly to entity using external file uploader widget (if available)
            const inputFiles = imageUploadElementRef.current?.querySelector("input[type='file']") as HTMLInputElement;
            if (inputFiles) {
                inputFiles.files = defaultValue.files as FileList;
                inputFiles.dispatchEvent(new Event("change", { bubbles: true }));
            }
            isInputProcessed.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const [formState, setFormState] = useState<imageConfigType>({
        files: null,
        alt: defaultValue?.alt ?? "",
        width: defaultValue?.width ?? 100,
        height: defaultValue?.height ?? 100,
        src: defaultValue?.src ?? undefined,
        keepAspectRatio: true
    });

    const onFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.files });
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const onInputCheckboxChange = (e: ChangeEvent<HTMLInputElement>): void => {
        e.stopPropagation();
        setFormState({ ...formState, keepAspectRatio: !formState.keepAspectRatio });
    };

    const onEmbedSelected = (image: Image): void => {
        setFormState({ ...formState, entityGuid: image.id, src: undefined, files: null });
        setSelectedImageEntity(image);
        setActiveTab("general");
    };

    const handleImageSelected = (event: CustomEvent<Image>): void => {
        const image = event.detail;
        onEmbedSelected(image);
    };

    const onEmbedDeleted = (): void => {
        setFormState({ ...formState, entityGuid: undefined, src: undefined });
        setSelectedImageEntity(undefined);
    };

    const onImageLoaded = (e: SyntheticEvent<HTMLImageElement>): void => {
        setFormState({ ...formState, width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight });
    };

    useEffect(() => {
        // event listener for image selection triggered from custom widgets JS Action
        const imgRef = imageUploadElementRef.current;

        if (imgRef !== null) {
            imgRef.addEventListener("imageSelected", handleImageSelected);
        }
        return () => {
            imgRef?.removeEventListener("imageSelected", handleImageSelected);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageUploadElementRef.current]);

    return (
        <DialogContent className={"image-dialog"} formOrientation={formOrientation}>
            <DialogHeader onClose={onClose}>{activeTab === "general" ? "Insert/Edit" : "Embed"} Images</DialogHeader>
            <DialogBody formOrientation={formOrientation}>
                <div ref={imageUploadElementRef}>
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
                    <div>
                        <If condition={activeTab === "general"}>
                            <FormControl
                                label="Source"
                                formOrientation={formOrientation}
                                inputId="rich-text-image-file-input"
                            >
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
                                            onLoad={onImageLoaded}
                                        />
                                        <span className="icon-container">
                                            <span className="icons icon-Delete" onClick={onEmbedDeleted}></span>
                                        </span>
                                    </div>
                                ) : enableDefaultUpload ? (
                                    <input
                                        id="rich-text-image-file-input"
                                        name="files"
                                        className="form-control mx-textarea-input mx-textarea-noresize code-input"
                                        type="file"
                                        accept={IMG_MIME_TYPES.join(", ")}
                                        onChange={onFileChange}
                                    ></input>
                                ) : undefined}
                            </FormControl>
                            <FormControl
                                label="Alternative description"
                                formOrientation={formOrientation}
                                inputId="rich-text-image-alt-input"
                            >
                                <input
                                    id="rich-text-image-alt-input"
                                    className="form-control"
                                    type="text"
                                    name="alt"
                                    onChange={onInputChange}
                                    value={formState.alt}
                                    ref={inputReference}
                                />
                            </FormControl>
                            <FormControl
                                label="Width"
                                className="image-dialog-size"
                                formOrientation={formOrientation}
                                inputId="rich-text-image-width-input"
                            >
                                <div className="flexcontainer image-dialog-size-container">
                                    <div className="flexcontainer image-dialog-size-input">
                                        <input
                                            id="rich-text-image-width-input"
                                            className="form-control"
                                            type="number"
                                            name="width"
                                            onChange={onInputChange}
                                            value={formState.width}
                                        />
                                        <span>px</span>
                                    </div>
                                    <div className="flexcontainer image-dialog-size-label">
                                        <label className="control-label">Height</label>
                                    </div>
                                    <div className="flexcontainer image-dialog-size-input">
                                        <input
                                            id="rich-text-image-height-input"
                                            className="form-control"
                                            type="number"
                                            name="height"
                                            onChange={onInputChange}
                                            value={formState.height}
                                            disabled={formState.keepAspectRatio}
                                        />
                                        <span>px</span>
                                    </div>
                                </div>
                            </FormControl>
                            <FormControl
                                label="Keep ratio"
                                formOrientation={formOrientation}
                                inputId="rich-text-image-keep-ratio-input"
                            >
                                <input
                                    id="rich-text-image-keep-ratio-input"
                                    type="checkbox"
                                    name="keepAspectRatio"
                                    checked={formState.keepAspectRatio}
                                    onChange={onInputCheckboxChange}
                                />
                            </FormControl>
                            <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
                        </If>
                        <If condition={activeTab === "embed"}>
                            <div className="image-dialog-upload">{imageSourceContent}</div>
                        </If>
                    </div>
                </div>
            </DialogBody>
        </DialogContent>
    );
}
