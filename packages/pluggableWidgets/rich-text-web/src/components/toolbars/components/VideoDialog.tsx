import { ReactElement, useState, useRef, FormEvent, useEffect } from "react";
import { parseEmbedCode } from "../../../utils/embedCodeParser";
import { matchPattern } from "../../../utils/videoUrlPattern";
import { useCurrentEditor } from "../../EditorContext";
import { VideoDialogProps } from "../helpers/toolbarTypes";
import { useDropdown } from "../hooks/useDropdown";
import "./Dialog.scss";

type TabMode = "url" | "embed";

export function VideoDialog({ onClose, referenceElement }: VideoDialogProps): ReactElement {
    const { editor } = useCurrentEditor();
    const [activeTab, setActiveTab] = useState<TabMode>("url");
    const [urlInput, setUrlInput] = useState("");
    const [embedCodeInput, setEmbedCodeInput] = useState("");
    const [width, setWidth] = useState("640");
    const [height, setHeight] = useState("480");
    const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const { refs, floatingStyles } = useDropdown({
        isOpen: true,
        onClose,
        referenceElement
    });

    // Handle URL input change
    const handleUrlChange = (value: string): void => {
        setUrlInput(value);

        if (!value.trim()) {
            setDetectedPlatform(null);
            setValidationError(null);
            return;
        }

        // Try to match against known patterns
        const pattern = matchPattern(value);

        if (pattern) {
            // Determine platform name
            let platformName = "Video";
            if (pattern.url.includes("youtube.com")) {
                platformName = "YouTube";
            } else if (pattern.url.includes("vimeo.com")) {
                platformName = "Vimeo";
            } else if (pattern.url.includes("dailymotion.com")) {
                platformName = "Dailymotion";
            } else if (pattern.url.includes("maps.google.com")) {
                platformName = "Google Maps";
            }

            setDetectedPlatform(platformName);
            setWidth(pattern.w.toString());
            setHeight(pattern.h.toString());
            setValidationError(null);
        } else {
            setDetectedPlatform(null);
            setValidationError("Unsupported video platform");
        }
    };

    // Handle embed code input change
    const handleEmbedCodeChange = (value: string): void => {
        setEmbedCodeInput(value);

        if (!value.trim()) {
            setDetectedPlatform(null);
            setValidationError(null);
            return;
        }

        // Parse and validate embed code
        const result = parseEmbedCode(value);

        if (result.valid && result.src) {
            setWidth(result.width || "640");
            setHeight(result.height || "480");
            setDetectedPlatform(result.domain || null);
            setValidationError(null);
        } else {
            setValidationError(result.error || "Invalid embed code");
        }
    };

    // Handle URL submission
    const handleUrlSubmit = (w: number, h: number): void => {
        if (!editor) return;

        const pattern = matchPattern(urlInput);

        if (!pattern) {
            setValidationError("Invalid URL");
            return;
        }

        // Check if it's a YouTube URL
        if (pattern.url.includes("youtube.com")) {
            editor
                .chain()
                .focus()
                .setYoutubeVideo({
                    src: urlInput.trim(),
                    width: isNaN(w) ? undefined : w,
                    height: isNaN(h) ? undefined : h
                })
                .run();
        } else {
            // Use GenericEmbed for other platforms
            editor
                .chain()
                .focus()
                .setGenericEmbed({
                    src: pattern.url,
                    width: w,
                    height: h
                })
                .run();
        }
    };

    // Handle embed code submission
    const handleEmbedSubmit = (w: number, h: number): void => {
        if (!editor) return;

        const parsed = parseEmbedCode(embedCodeInput);

        if (!parsed.valid || !parsed.src) {
            setValidationError(parsed.error || "Invalid embed code");
            return;
        }

        editor
            .chain()
            .focus()
            .setGenericEmbed({
                src: parsed.src,
                width: w,
                height: h,
                title: parsed.title || null,
                frameborder: parsed.frameborder,
                allow: parsed.allow || null,
                allowfullscreen: parsed.allowfullscreen
            })
            .run();
    };

    // Unified submit handler
    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        if (!editor) return;

        const w = parseInt(width, 10);
        const h = parseInt(height, 10);

        if (activeTab === "url") {
            handleUrlSubmit(w, h);
        } else {
            handleEmbedSubmit(w, h);
        }

        onClose();
    };

    // Reset state when switching tabs
    useEffect(() => {
        setValidationError(null);
        setDetectedPlatform(null);
    }, [activeTab]);

    const isSubmitDisabled =
        (activeTab === "url" && (!urlInput.trim() || !!validationError)) ||
        (activeTab === "embed" && (!embedCodeInput.trim() || !!validationError));

    return (
        <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 1000 }}>
            <div ref={dialogRef} className="toolbar-dialog video-dialog">
                <form onSubmit={handleSubmit}>
                    <h3>Insert Video</h3>

                    {/* Tab Navigation */}
                    <div className="dialog-tabs">
                        <button
                            type="button"
                            className={activeTab === "url" ? "active" : ""}
                            onClick={() => setActiveTab("url")}
                        >
                            URL
                        </button>
                        <button
                            type="button"
                            className={activeTab === "embed" ? "active" : ""}
                            onClick={() => setActiveTab("embed")}
                        >
                            Embed Code
                        </button>
                    </div>

                    {/* URL Tab Content */}
                    {activeTab === "url" && (
                        <div className="tab-content">
                            <div className="dialog-field">
                                <label htmlFor="video-url">Video URL</label>
                                <input
                                    id="video-url"
                                    type="text"
                                    value={urlInput}
                                    onChange={e => handleUrlChange(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                                    autoFocus
                                />
                            </div>

                            {/* Detection Status */}
                            {detectedPlatform && (
                                <div className="detection-status success">✓ {detectedPlatform} video detected</div>
                            )}

                            {validationError && <div className="detection-status error">⚠️ {validationError}</div>}

                            {/* Size Fields */}
                            <div className="dialog-field-row">
                                <div className="dialog-field">
                                    <label htmlFor="video-width">Width (px)</label>
                                    <input
                                        id="video-width"
                                        type="number"
                                        value={width}
                                        onChange={e => setWidth(e.target.value)}
                                        placeholder="640"
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label htmlFor="video-height">Height (px)</label>
                                    <input
                                        id="video-height"
                                        type="number"
                                        value={height}
                                        onChange={e => setHeight(e.target.value)}
                                        placeholder="480"
                                    />
                                </div>
                            </div>

                            <div className="dialog-info">ℹ️ Supported: YouTube, Vimeo, Dailymotion, Google Maps</div>
                        </div>
                    )}

                    {/* Embed Code Tab Content */}
                    {activeTab === "embed" && (
                        <div className="tab-content">
                            <div className="dialog-field">
                                <label htmlFor="embed-code">Embed Code</label>
                                <textarea
                                    id="embed-code"
                                    value={embedCodeInput}
                                    onChange={e => handleEmbedCodeChange(e.target.value)}
                                    placeholder='<iframe src="https://..." width="640" height="360"></iframe>'
                                    rows={6}
                                    autoFocus
                                />
                            </div>

                            {/* Detection Status */}
                            {detectedPlatform && (
                                <div className="detection-status success">
                                    ✓ Valid iframe detected
                                    <br />
                                    <small>Source: {detectedPlatform}</small>
                                </div>
                            )}

                            {validationError && <div className="detection-status error">⚠️ {validationError}</div>}

                            <div className="dialog-info warning">
                                ⚠️ Only use embed codes from trusted platforms. Embed codes from untrusted sources may
                                pose security risks.
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="dialog-actions">
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitDisabled}>
                            Insert
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
