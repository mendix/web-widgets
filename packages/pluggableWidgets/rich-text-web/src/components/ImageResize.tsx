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
    const currentSize = useRef({ width: size.width, height: size.height });

    useEffect(() => {
        if (node.attrs.width) {
            const nextSize = {
                width: node.attrs.width,
                height: node.attrs.height || "auto"
            };
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSize(nextSize);
            currentSize.current = nextSize;
        }
    }, [node.attrs.width, node.attrs.height]);

    const handleMouseDown = (e: globalThis.React.MouseEvent, corner: string): void => {
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
                const nextSize = {
                    width: `${Math.round(newWidth)}px`,
                    height: `${Math.round(newHeight)}px`
                };
                currentSize.current = nextSize;
                setSize(nextSize);
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
        <NodeViewWrapper className={`image-wrapper ${isResizing ? "resizing" : ""}`}>
            <div className="image-container" style={{ width: size.width, height: size.height }}>
                <img
                    ref={imgRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt || ""}
                    draggable={false}
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
