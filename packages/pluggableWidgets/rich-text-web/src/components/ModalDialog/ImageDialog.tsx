import { ChangeEvent, createElement, Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { type imageConfigType } from "../../utils/formats";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";
import { IMG_MIME_TYPES } from "../CustomToolbars/constants";
import classNames from "classnames";
import { If } from "@mendix/widget-plugin-component-kit/If";
import { RichTextContainerProps } from "../../../typings/RichTextProps";
import { fetchDocumentUrl, fetchImageThumbnail } from "../../utils/mx-data";

type imageListType = {
    id: string;
    url: string;
    thumbnailUrl?: string;
};

export interface ImageDialogProps extends Pick<RichTextContainerProps, "imageSource"> {
    onSubmit(value: imageConfigType): void;
    onClose(): void;
    defaultValue?: imageConfigType;
}

export interface EntityImageDialogProps extends ImageDialogProps {
    onSelect(image: imageListType): void;
}

function EntityImageDialog(props: EntityImageDialogProps): ReactElement {
    const { imageSource, onSelect } = props;
    const [images, setImages] = useState<imageListType[]>([]);

    useEffect(() => {
        if (imageSource && imageSource.items && imageSource.items.length > 0 && imageSource.status === "available") {
            const newImages: imageListType[] = imageSource.items.map(item => {
                const guid = item.id;
                const src = fetchDocumentUrl(item.id);
                return {
                    id: guid,
                    url: src
                };
            });

            Promise.all(
                newImages.map(async image => {
                    if (image.url) {
                        const thumbnailUrl = await fetchImageThumbnail(image.url);
                        console.log("Fetched thumbnail for image:", image.id, thumbnailUrl);
                        return { ...image, thumbnailUrl };
                    }
                    return image;
                })
            ).then(fetchedImages => {
                setImages(fetchedImages);
            });
        }
    }, [imageSource, imageSource?.status, imageSource?.items]);

    if (!imageSource || imageSource.status !== "available") {
        return <div className="mx-text mx-text-error">Image source is not available</div>;
    }

    return (
        <Fragment>
            {images.length > 0 ? (
                <div className="mx-image-dialog-list">
                    {images.map(image => (
                        <div key={image.id} className="mx-image-dialog-item" onClick={() => onSelect(image)}>
                            <img
                                src={image.thumbnailUrl || image.url}
                                alt={image.id}
                                className="mx-image-dialog-thumbnail"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mx-text mx-text-error">No images found in the datasource</div>
            )}
        </Fragment>
    );
}

export default function ImageDialog(props: ImageDialogProps): ReactElement {
    const { onClose, defaultValue, onSubmit, imageSource } = props;
    const [activeTab, setActiveTab] = useState("general");
    const [selectedImageEntity, setSelectedImageEntity] = useState<imageListType>();
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

    const onEmbedDeleted = (): void => {
        setFormState({ ...formState, entityGuid: undefined, src: undefined });
        setSelectedImageEntity(undefined);
    };

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
                                <a href="#">From datasource</a>
                            </li>
                        </ul>
                    </div>
                )}
                <div>
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
                    </If>
                    <If condition={activeTab === "embed"}>
                        <EntityImageDialog {...props} onSelect={onEmbedSelected} />
                    </If>
                </div>
            </DialogBody>
        </DialogContent>
    );
}
