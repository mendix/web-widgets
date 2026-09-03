import classNames from "classnames";
import { ReactElement, useState, useEffect, KeyboardEvent } from "react";
import { useDropzone } from "react-dropzone";
import { DialogShell } from "./DialogShell";
import { useT } from "../../../utils/i18n";
import { MAX_FILE_SIZE, formatFileSize, readFileAsDataUrl, validateImageFile } from "../../../utils/imageFiles";
import { useCurrentEditor } from "../../EditorContext";
import { ImageDialogProps, EntityImage, ImageSourceMode } from "../helpers/toolbarTypes";
import "./Dialog.scss";

const TITLE_ID = "rich-text-image-dialog-title";

const toPixelValue = (value: string): string | undefined => {
    const parsed = Number(value);
    if (!value.trim() || !Number.isFinite(parsed) || parsed <= 0) {
        return undefined;
    }
    return `${parsed}px`;
};

export function ImageDialog({ onClose, referenceElement }: ImageDialogProps): ReactElement {
    const { editor, imageConfig, dialogStyle } = useCurrentEditor();
    const { imageSourceContent, enableDefaultUpload, hasImageSource } = imageConfig;
    const t = useT();
    const [activeTab, setActiveTab] = useState<ImageSourceMode>("url");
    const [src, setSrc] = useState("");
    const [alt, setAlt] = useState("");
    const [title, setTitle] = useState("");
    const [width, setWidth] = useState("250");
    const [height, setHeight] = useState("");
    const [maintainRatio, setMaintainRatio] = useState(true);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedEntityImage, setSelectedEntityImage] = useState<EntityImage | null>(null);
    const [dragError, setDragError] = useState<string>("");
    // The `imageSelected` event target: app-developer JS actions dispatch that event at the
    // `.toolbar-dialog` node, so `DialogShell` forwards this ref onto it rather than owning it.
    // Held in state, not a ref: the dialog is portalled, and a portal's children mount one commit
    // after the dialog itself, so a mount-time effect would still see `null`.
    const [dialogNode, setDialogNode] = useState<HTMLDivElement | null>(null);

    const handleTabChange = (newTab: ImageSourceMode): void => {
        setActiveTab(newTab);
        setDragError("");

        if (newTab === "url") {
            // Switching to URL mode - clear upload and entity data
            setUploadedFile(null);
            setSelectedEntityImage(null);
            if (src && (src.startsWith("data:") || selectedEntityImage)) {
                setSrc("");
            }
        } else if (newTab === "upload") {
            // Switching to Upload mode - clear URL and entity data
            setSelectedEntityImage(null);
            if (src && !src.startsWith("data:")) {
                setSrc("");
            }
        } else if (newTab === "entity") {
            // Switching to Entity mode - clear upload and URL data
            setUploadedFile(null);
            if (src && (src.startsWith("data:") || !selectedEntityImage)) {
                setSrc("");
            }
        }
    };

    const handleFileDrop = (acceptedFiles: File[]): void => {
        setDragError("");

        if (acceptedFiles.length === 0) {
            return;
        }

        const file = acceptedFiles[0];
        const error = validateImageFile(file);

        if (error) {
            setDragError(error.arg ? t(error.key, error.arg) : t(error.key));
            return;
        }

        readFileAsDataUrl(file).then(
            base64 => {
                setSrc(base64);
                setUploadedFile(file);
            },
            () => {
                setDragError(t("image.errorReadFailed"));
            }
        );
    };

    const handleClearFile = (): void => {
        setSrc("");
        setUploadedFile(null);
        setDragError("");
    };

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop: handleFileDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"]
        },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE,
        disabled: activeTab !== "upload",
        multiple: false
    });

    const handleInsert = (): void => {
        if (!editor || !src.trim()) return;

        const imageAttrs: any = {
            src: src.trim(),
            alt: alt.trim() || undefined,
            title: title.trim() || undefined
        };

        const widthPx = toPixelValue(width);
        if (widthPx) {
            imageAttrs.width = widthPx;
        }

        if (!maintainRatio) {
            const heightPx = toPixelValue(height);
            if (heightPx) {
                imageAttrs.height = heightPx;
            }
        }

        // Add entity attributes if this is a database image
        if (selectedEntityImage?.id) {
            imageAttrs.dataEntity = true;
            imageAttrs.dataEntityId = selectedEntityImage.id;
        }

        editor.chain().focus().setImage(imageAttrs).run();
        onClose();
    };

    // Enter inserts only from the dialog's own single-line inputs. The dialog deliberately has no
    // <form>, so nothing inside `imageSourceContent` or the dropzone can trigger an insert.
    // preventDefault also stops implicit submission of any form the widget itself is placed in.
    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key !== "Enter") {
            return;
        }
        e.preventDefault();
        handleInsert();
    };

    const handleImageSelected = (event: CustomEvent<EntityImage>): void => {
        const imageData = event.detail;
        if (imageData.url && isPromise(imageData.url)) {
            (imageData.url as unknown as Promise<string>).then((url: string) => {
                // Use the URL for display, but we'll pass the ID for storage
                setSrc(url);
            });
        } else {
            setSrc(imageData.url as string);
        }
        // Set the selected entity image
        setSelectedEntityImage(imageData);

        setActiveTab("entity");
    };

    useEffect(() => {
        // event listener for image selection triggered from custom widgets JS Action
        if (dialogNode === null) {
            return;
        }

        dialogNode.addEventListener("imageSelected", handleImageSelected);
        return () => {
            dialogNode.removeEventListener("imageSelected", handleImageSelected);
        };
        // Registered once per dialog node. The handler only uses state setters, so it reads no
        // stale state.
    }, [dialogNode]);

    return (
        <DialogShell
            mode={dialogStyle}
            onClose={onClose}
            referenceElement={referenceElement}
            className="image-dialog"
            ariaLabelledBy={TITLE_ID}
            dialogRef={setDialogNode}
        >
            {/* Intentionally not a <form>: `imageSourceContent` is app-developer content, and a
                descendant <button> without an explicit type would implicitly submit it. */}
            <div className="dialog-layout">
                <h3 id={TITLE_ID}>{t("image.title")}</h3>

                <div className="dialog-scroll">
                    {/* Tab Navigation */}
                    <div className="dialog-tabs">
                        <button
                            type="button"
                            className={activeTab === "url" ? "active" : ""}
                            onClick={() => handleTabChange("url")}
                        >
                            {t("image.tabUrl")}
                        </button>
                        {enableDefaultUpload && (
                            <button
                                type="button"
                                className={activeTab === "upload" ? "active" : ""}
                                onClick={() => handleTabChange("upload")}
                            >
                                {t("image.tabUpload")}
                            </button>
                        )}
                        {hasImageSource && (
                            <button
                                type="button"
                                className={activeTab === "entity" ? "active" : ""}
                                onClick={() => handleTabChange("entity")}
                            >
                                {t("image.tabMediaLibrary")}
                            </button>
                        )}
                    </div>

                    {/* URL Tab Content */}
                    {activeTab === "url" && (
                        <div className="tab-content">
                            <div className="dialog-field">
                                <label htmlFor="image-src">{t("image.url")}</label>
                                <input
                                    id="image-src"
                                    type="text"
                                    value={src}
                                    onChange={e => setSrc(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder={t("image.urlPlaceholder")}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Upload Tab Content */}
                    {enableDefaultUpload && activeTab === "upload" && (
                        <div className="tab-content">
                            {(() => {
                                const isReject = isDragActive && isDragReject;
                                const isAccept = isDragActive && isDragAccept;
                                const hasWarning = isReject || Boolean(dragError);
                                const message = dragError
                                    ? dragError
                                    : isAccept
                                      ? t("image.dropActive")
                                      : isReject
                                        ? t("image.dropRejected")
                                        : t("image.dropIdle");

                                return (
                                    <div
                                        {...getRootProps()}
                                        className={classNames("image-dialog-dropzone", {
                                            "image-dialog-dropzone--active": isAccept,
                                            "image-dialog-dropzone--warning": hasWarning
                                        })}
                                    >
                                        <div className="image-dialog-dropzone__icon" />
                                        <p className="image-dialog-dropzone__text">
                                            {hasWarning && (
                                                <span className="image-dialog-dropzone__inline-icon image-dialog-dropzone__inline-icon--warning" />
                                            )}
                                            {message}
                                        </p>
                                        <input {...getInputProps()} />
                                    </div>
                                );
                            })()}

                            {/* Preview - Only when file is uploaded */}
                            {uploadedFile && src && (
                                <div className="dialog-preview">
                                    <img src={src} alt="Preview" className="preview-thumbnail" />
                                    <div className="preview-info">
                                        <div className="preview-name">{uploadedFile.name}</div>
                                        <div className="preview-size">{formatFileSize(uploadedFile.size)}</div>
                                    </div>
                                    <button type="button" className="preview-clear" onClick={handleClearFile}>
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Database Tab Content */}
                    {hasImageSource && activeTab === "entity" && (
                        <div className="tab-content">
                            {/* Mendix widget for entity selection */}
                            <div className="image-dialog-entity">{imageSourceContent}</div>

                            {/* Preview - Only when entity image is selected */}
                            {selectedEntityImage && src && (
                                <div className="dialog-preview">
                                    <img
                                        src={selectedEntityImage.thumbnailUrl || src}
                                        alt="Preview"
                                        className="preview-thumbnail"
                                    />
                                    <div className="preview-info">
                                        <div className="preview-name">{t("image.fromDatabase")}</div>
                                        <div className="preview-size">
                                            ID: {selectedEntityImage.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="preview-clear"
                                        onClick={() => {
                                            setSelectedEntityImage(null);
                                            setSrc("");
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Alt Text - Always visible */}
                    <div className="dialog-field">
                        <label htmlFor="image-alt">{t("image.alt")}</label>
                        <input
                            id="image-alt"
                            type="text"
                            value={alt}
                            onChange={e => setAlt(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder={t("image.altPlaceholder")}
                        />
                    </div>

                    {/* Title - Always visible */}
                    <div className="dialog-field">
                        <label htmlFor="image-title">{t("image.titleField")}</label>
                        <input
                            id="image-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder={t("image.titlePlaceholder")}
                        />
                    </div>

                    {/* Dimensions - Always visible */}
                    <div className="dialog-field-row">
                        <div className="dialog-field">
                            <label htmlFor="image-width">{t("image.width")}</label>
                            <input
                                id="image-width"
                                type="number"
                                value={width}
                                onChange={e => setWidth(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                            />
                        </div>
                        <div className="dialog-field">
                            <label htmlFor="image-height">{t("image.height")}</label>
                            <input
                                id="image-height"
                                type="number"
                                value={height}
                                onChange={e => setHeight(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                disabled={maintainRatio}
                            />
                        </div>
                    </div>
                    <div className="dialog-field dialog-field--checkbox">
                        <label htmlFor="image-maintain-ratio">
                            <input
                                id="image-maintain-ratio"
                                type="checkbox"
                                checked={maintainRatio}
                                onChange={e => setMaintainRatio(e.target.checked)}
                            />
                            {t("image.maintainRatio")}
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="dialog-actions">
                    <button type="button" className="btn" onClick={onClose}>
                        {t("image.cancel")}
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleInsert} disabled={!src?.trim()}>
                        {t("image.insert")}
                    </button>
                </div>
            </div>
        </DialogShell>
    );
}

function isPromise(obj: any): boolean {
    return obj !== null && typeof obj === "object" && typeof obj.then === "function";
}
