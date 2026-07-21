import { ReactElement, useState, useRef, useEffect, FormEvent } from "react";
import { useDropzone } from "react-dropzone";
import { useCurrentEditor } from "../../EditorContext";
import { ImageDialogProps, EntityImage, ImageSourceMode, MAX_FILE_SIZE } from "../helpers/toolbarTypes";
import { useDropdown } from "../hooks/useDropdown";
import "./Dialog.scss";

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
        return `File must be smaller than 5MB (current: ${formatFileSize(file.size)})`;
    }
    if (!file.type.startsWith("image/")) {
        return "Only image files are allowed";
    }
    return null;
};

export function ImageDialog({ onClose, referenceElement, imageSourceContent }: ImageDialogProps): ReactElement {
    const { editor } = useCurrentEditor();
    const [activeTab, setActiveTab] = useState<ImageSourceMode>("url");
    const [src, setSrc] = useState("");
    const [alt, setAlt] = useState("");
    const [title, setTitle] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedEntityImage, setSelectedEntityImage] = useState<EntityImage | null>(null);
    const [dragError, setDragError] = useState<string>("");
    const dialogRef = useRef<HTMLDivElement>(null);

    const { refs, floatingStyles } = useDropdown({
        isOpen: true,
        onClose,
        referenceElement
    });

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
        const error = validateFile(file);

        if (error) {
            setDragError(error);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setSrc(base64);
            setUploadedFile(file);
        };
        reader.onerror = () => {
            setDragError("Failed to read file");
        };
        reader.readAsDataURL(file);
    };

    const handleClearFile = (): void => {
        setSrc("");
        setUploadedFile(null);
        setDragError("");
    };

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop: handleFileDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"]
        },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE,
        disabled: activeTab !== "upload",
        multiple: false
    });

    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        if (!editor || !src.trim()) return;

        const imageAttrs: any = {
            src: src.trim(),
            alt: alt.trim() || undefined,
            title: title.trim() || undefined
        };

        // Add entity attributes if this is a database image
        if (selectedEntityImage?.id) {
            imageAttrs.dataEntity = true;
            imageAttrs.dataEntityId = selectedEntityImage.id;
        }

        editor.chain().focus().setImage(imageAttrs).run();
        onClose();
    };

    const handleImageSelected = (event: CustomEvent<EntityImage>): void => {
        const imageData = event.detail;

        // Set the selected entity image
        setSelectedEntityImage(imageData);

        // Use the URL for display, but we'll pass the ID for storage
        setSrc(imageData.url);

        // Switch to entity tab if not already
        if (activeTab !== "entity") {
            setActiveTab("entity");
        }
    };

    useEffect(() => {
        // event listener for image selection triggered from custom widgets JS Action
        const imgRef = dialogRef.current;

        if (imgRef !== null) {
            imgRef.addEventListener("imageSelected", handleImageSelected);
        }
        return () => {
            imgRef?.removeEventListener("imageSelected", handleImageSelected);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialogRef.current]);

    return (
        <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 1000 }}>
            <div ref={dialogRef} className="toolbar-dialog image-dialog">
                <form onSubmit={handleSubmit}>
                    <h3>Insert Image</h3>

                    {/* Tab Navigation */}
                    <div className="dialog-tabs">
                        <button
                            type="button"
                            className={activeTab === "url" ? "active" : ""}
                            onClick={() => handleTabChange("url")}
                        >
                            URL
                        </button>
                        <button
                            type="button"
                            className={activeTab === "upload" ? "active" : ""}
                            onClick={() => handleTabChange("upload")}
                        >
                            Upload
                        </button>
                        <button
                            type="button"
                            className={activeTab === "entity" ? "active" : ""}
                            onClick={() => handleTabChange("entity")}
                        >
                            Media Library
                        </button>
                    </div>

                    {/* URL Tab Content */}
                    {activeTab === "url" && (
                        <div className="tab-content">
                            <div className="dialog-field">
                                <label htmlFor="image-src">Image URL</label>
                                <input
                                    id="image-src"
                                    type="text"
                                    value={src}
                                    onChange={e => setSrc(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Upload Tab Content */}
                    {activeTab === "upload" && (
                        <div className="tab-content">
                            <div
                                {...getRootProps()}
                                className={`dialog-dropzone ${isDragActive ? "drag-active" : ""} ${
                                    isDragReject ? "drag-reject" : ""
                                }`}
                            >
                                <input {...getInputProps()} />
                                <div className="dropzone-icon">📁</div>
                                <div className="dropzone-text">
                                    {isDragActive ? "Drop image here..." : "Drag & drop image here, or click to browse"}
                                </div>
                                {dragError && <div className="dropzone-error">{dragError}</div>}
                            </div>

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
                    {activeTab === "entity" && (
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
                                        <div className="preview-name">Image from database</div>
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
                        <label htmlFor="image-alt">Alt text (optional)</label>
                        <input
                            id="image-alt"
                            type="text"
                            value={alt}
                            onChange={e => setAlt(e.target.value)}
                            placeholder="Description of the image"
                        />
                    </div>

                    {/* Title - Always visible */}
                    <div className="dialog-field">
                        <label htmlFor="image-title">Title (optional)</label>
                        <input
                            id="image-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Image title"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="dialog-actions">
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" disabled={!src.trim()}>
                            Insert
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
