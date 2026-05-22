import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect, ReactElement } from "react";

export function ImageResize(props: NodeViewProps): ReactElement {
    const { node, updateAttributes } = props;
    const [isResizing, setIsResizing] = useState(false);
    const [size, setSize] = useState({
        width: node.attrs.width || "auto",
        height: node.attrs.height || "auto"
    });
    const imgRef = useRef<HTMLImageElement>(null);
    const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

    useEffect(() => {
        if (node.attrs.width) {
            setSize({
                width: node.attrs.width,
                height: node.attrs.height || "auto"
            });
        }
    }, [node.attrs.width, node.attrs.height]);

    const handleMouseDown = (e: React.MouseEvent, corner: string): void => {
        e.preventDefault();
        e.stopPropagation();

        const img = imgRef.current;
        if (!img) return;

        const rect = img.getBoundingClientRect();
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
                setSize({
                    width: `${Math.round(newWidth)}px`,
                    height: `${Math.round(newHeight)}px`
                });
            }
        };

        const handleMouseUp = (): void => {
            setIsResizing(false);
            updateAttributes({
                width: size.width,
                height: size.height
            });
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    return (
        <NodeViewWrapper className={`image-wrapper ${isResizing ? "resizing" : ""}`}>
            <div className="image-container" style={{ width: size.width, height: size.height }}>
                <img
                    ref={imgRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt || ""}
                    style={{
                        width: size.width,
                        height: size.height
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
