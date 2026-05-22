import { useFloating, offset, flip, shift } from "@floating-ui/react";
import { ReactElement, useState, useRef, useEffect, FormEvent } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { VideoDialogProps } from "../helpers/toolbarTypes";
import "./Dialog.scss";

export function VideoDialog({ onClose, referenceElement }: VideoDialogProps): ReactElement {
    const { editor } = useCurrentEditor();
    const [src, setSrc] = useState("");
    const [width, setWidth] = useState("640");
    const [height, setHeight] = useState("480");
    const dialogRef = useRef<HTMLDivElement>(null);

    const { x, y, strategy, refs } = useFloating({
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        elements: {
            reference: referenceElement
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        if (!editor || !src.trim()) return;

        const w = parseInt(width, 10);
        const h = parseInt(height, 10);
        editor
            .chain()
            .focus()
            .setYoutubeVideo({
                src: src.trim(),
                width: isNaN(w) ? undefined : w,
                height: isNaN(h) ? undefined : h
            })
            .run();
        onClose();
    };

    return (
        <div
            ref={refs.setFloating}
            style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 1000
            }}
        >
            <div ref={dialogRef} className="toolbar-dialog">
                <form onSubmit={handleSubmit}>
                    <h3>Insert YouTube Video</h3>
                    <div className="dialog-field">
                        <label htmlFor="video-src">YouTube URL</label>
                        <input
                            id="video-src"
                            type="text"
                            value={src}
                            onChange={e => setSrc(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            autoFocus
                        />
                    </div>
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
