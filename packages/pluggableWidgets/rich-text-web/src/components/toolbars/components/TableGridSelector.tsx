import { ReactElement, useState, useRef, useEffect } from "react";
import { TableGridSelectorProps, MAX_TABLE_ROWS, MAX_TABLE_COLS } from "../helpers/toolbarTypes";
import "./TableGridSelector.scss";

const MAX_ROWS = MAX_TABLE_ROWS;
const MAX_COLS = MAX_TABLE_COLS;

export function TableGridSelector({ editor, onClose }: TableGridSelectorProps): ReactElement {
    const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleCellHover = (row: number, col: number): void => {
        if (isDragging || true) {
            setHoveredCell({ row, col });
        }
    };

    const handleMouseDown = (): void => {
        setIsDragging(true);
    };

    const handleMouseUp = (): void => {
        if (hoveredCell.row > 0 && hoveredCell.col > 0) {
            editor
                .chain()
                .focus()
                .insertTable({
                    rows: hoveredCell.row,
                    cols: hoveredCell.col,
                    withHeaderRow: true
                })
                .run();
            onClose();
        }
        setIsDragging(false);
    };

    const renderGrid = (): ReactElement[] => {
        const cells: ReactElement[] = [];

        for (let row = 1; row <= MAX_ROWS; row++) {
            for (let col = 1; col <= MAX_COLS; col++) {
                const isSelected = row <= hoveredCell.row && col <= hoveredCell.col;
                cells.push(
                    <div
                        key={`${row}-${col}`}
                        className={`table-grid-cell ${isSelected ? "selected" : ""}`}
                        onMouseEnter={() => handleCellHover(row, col)}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                    />
                );
            }
        }

        return cells;
    };

    const displayText = hoveredCell.row > 0 && hoveredCell.col > 0 ? `${hoveredCell.row} × ${hoveredCell.col}` : "";

    return (
        <div ref={gridRef} className="table-grid-selector">
            <div className="table-grid">{renderGrid()}</div>
            {displayText && <div className="table-grid-label">{displayText}</div>}
        </div>
    );
}
