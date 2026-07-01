import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useState, useRef, ReactElement, MouseEvent as ReactMouseEvent } from "react";

export function YouTubeResize(props: NodeViewProps): ReactElement {
    const { node, updateAttributes } = props;
    const [isResizing, setIsResizing] = useState(false);
    const [size, setSize] = useState({
        width: node.attrs.width || 640,
        height: node.attrs.height || 480
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const currentSize = useRef({ width: size.width, height: size.height });

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

    return (
        <NodeViewWrapper className={`youtube-wrapper ${isResizing ? "resizing" : ""}`}>
            <div
                ref={containerRef}
                className="youtube-container"
                style={{ width: `${size.width}px`, height: `${size.height}px` }}
            >
                <iframe
                    src={node.attrs.src}
                    width={size.width}
                    height={size.height}
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
