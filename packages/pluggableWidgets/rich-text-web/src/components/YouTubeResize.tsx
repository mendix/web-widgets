import { getEmbedUrlFromYoutubeUrl, YoutubeOptions } from "@tiptap/extension-youtube";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useState, useRef, useMemo, ReactElement, MouseEvent as ReactMouseEvent } from "react";
import { useT } from "../utils/i18n";

/** Permissions the YouTube player needs for fullscreen, autoplay and DRM-protected content. */
const IFRAME_ALLOW =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

/** Upper bound on the stored source shown in the unplayable placeholder. */
const MAX_SOURCE_LENGTH = 200;

function truncateSource(src: unknown): string {
    if (typeof src !== "string") {
        return "";
    }
    return src.length > MAX_SOURCE_LENGTH ? `${src.slice(0, MAX_SOURCE_LENGTH)}…` : src;
}

export function YouTubeResize(props: NodeViewProps): ReactElement {
    const { node, updateAttributes, extension } = props;
    const t = useT();
    const [isResizing, setIsResizing] = useState(false);
    const [size, setSize] = useState({
        width: node.attrs.width || 640,
        height: node.attrs.height || 480
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const currentSize = useRef({ width: size.width, height: size.height });

    // `node.attrs.src` is the canonical watch URL the Youtube extension stores; YouTube
    // refuses to frame it (X-Frame-Options). Convert to an embed URL for display only,
    // using the same helper and the same options renderHTML() uses, so the editing view
    // and the serialized output configure an identical player. Memoised on a key that is
    // stable during a resize drag: a changing src would reload the player mid-drag.
    const options = extension.options as YoutubeOptions;
    const embedUrl = useMemo(
        () =>
            getEmbedUrlFromYoutubeUrl({
                url: typeof node.attrs.src === "string" ? node.attrs.src : "",
                allowFullscreen: options.allowFullscreen,
                autoplay: options.autoplay,
                ccLanguage: options.ccLanguage,
                ccLoadPolicy: options.ccLoadPolicy,
                controls: options.controls,
                disableKBcontrols: options.disableKBcontrols,
                enableIFrameApi: options.enableIFrameApi,
                endTime: options.endTime,
                interfaceLanguage: options.interfaceLanguage,
                ivLoadPolicy: options.ivLoadPolicy,
                loop: options.loop,
                modestBranding: options.modestBranding,
                nocookie: options.nocookie,
                origin: options.origin,
                playlist: options.playlist,
                progressBarColor: options.progressBarColor,
                startAt: node.attrs.start || 0,
                rel: options.rel
            }),
        [node.attrs.src, node.attrs.start, options]
    );

    const handleMouseDown = (e: ReactMouseEvent, corner: string): void => {
        e.preventDefault();
        e.stopPropagation();

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        startPos.current = {
            x: e.clientX,
            y: e.clientY,
            width: rect.width,
            height: rect.height
        };

        setIsResizing(true);

        const handleMouseMove = (moveEvent: MouseEvent): void => {
            const deltaX = moveEvent.clientX - startPos.current.x;

            let newWidth = startPos.current.width;
            let newHeight = startPos.current.height;

            if (corner === "se" || corner === "sw" || corner === "ne" || corner === "nw") {
                newWidth = startPos.current.width + (corner.includes("e") ? deltaX : -deltaX);
                const aspectRatio = startPos.current.height / startPos.current.width;
                newHeight = newWidth * aspectRatio;
            }

            if (newWidth > 50) {
                const roundedWidth = Math.round(newWidth);
                const roundedHeight = Math.round(newHeight);

                currentSize.current = {
                    width: roundedWidth,
                    height: roundedHeight
                };

                setSize({
                    width: roundedWidth,
                    height: roundedHeight
                });
            }
        };

        const handleMouseUp = (): void => {
            setIsResizing(false);
            updateAttributes({
                width: currentSize.current.width,
                height: currentSize.current.height
            });
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    // No embed URL means the stored source is not a recognisable YouTube URL. Never fall
    // back to the raw src (that is the blocked-frame case) and never render an empty
    // wrapper, which would be indistinguishable from the video having been dropped from
    // the document. Show the source as plain text so the user can fix or replace it; it is
    // untrusted stored data, so it must not become a link or raw HTML.
    if (!embedUrl) {
        return (
            <NodeViewWrapper className="youtube-wrapper">
                <div className="youtube-unplayable" style={{ width: `${size.width}px`, height: `${size.height}px` }}>
                    {t("video.unplayableSource", truncateSource(node.attrs.src))}
                </div>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper className={`youtube-wrapper ${isResizing ? "resizing" : ""}`}>
            <div
                ref={containerRef}
                className="youtube-container"
                style={{ width: `${size.width}px`, height: `${size.height}px` }}
            >
                <iframe
                    src={embedUrl}
                    title={t("video.frameTitle")}
                    width={size.width}
                    height={size.height}
                    allow={IFRAME_ALLOW}
                    allowFullScreen
                    style={{
                        width: `${size.width}px`,
                        height: `${size.height}px`
                    }}
                />
                <div className="resize-handles">
                    <div className="resize-handle nw" onMouseDown={e => handleMouseDown(e, "nw")} />
                    <div className="resize-handle ne" onMouseDown={e => handleMouseDown(e, "ne")} />
                    <div className="resize-handle sw" onMouseDown={e => handleMouseDown(e, "sw")} />
                    <div className="resize-handle se" onMouseDown={e => handleMouseDown(e, "se")} />
                </div>
            </div>
        </NodeViewWrapper>
    );
}
