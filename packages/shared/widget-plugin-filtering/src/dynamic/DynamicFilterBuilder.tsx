import { UseSelectProps } from "downshift";
import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useRef, useState } from "react";
import { Select } from "@mendix/widget-plugin-dropdown-filter/controls/select/Select";
import { OptionWithState } from "@mendix/widget-plugin-dropdown-filter/typings/OptionWithState";
import { DynamicFilterRow, DynamicFilterSet } from "./DynamicFilterSet";
import { RowValue } from "./RowValue";

export interface DynamicFilterBuilderTexts {
    addFilter: string;
    clearAll: string;
    removeFilter: string;
    fieldPicker: string;
}

export interface DynamicFilterBuilderProps {
    filterSet: DynamicFilterSet;
    texts: DynamicFilterBuilderTexts;
    /** Used to name the reused filter controls. */
    name: string;
}

type FocusTarget = { kind: "field"; rowId: number } | { kind: "remove"; rowId: number } | { kind: "add" };

const FOCUSABLE = {
    field: ".dynamic-filters-field [role='combobox']",
    remove: ".dynamic-filters-remove"
} as const;

/** Lets end users build a Filter Set: always-visible rows, plus "Add filter" and "Clear all". */
export const DynamicFilterBuilder = observer(function DynamicFilterBuilder(
    props: DynamicFilterBuilderProps
): ReactElement {
    const { filterSet, texts } = props;
    const rowRefs = useRef(new Map<number, HTMLLIElement>());
    const addRef = useRef<HTMLButtonElement>(null);
    const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);

    useEffect(() => {
        if (!focusTarget) {
            return;
        }
        if (focusTarget.kind === "add") {
            addRef.current?.focus();
        } else {
            rowRefs.current.get(focusTarget.rowId)?.querySelector<HTMLElement>(FOCUSABLE[focusTarget.kind])?.focus();
        }
        setFocusTarget(null);
    }, [focusTarget]);

    const handleAdd = (): void => {
        const row = filterSet.addRow();
        setFocusTarget({ kind: "field", rowId: row.id });
    };

    const handleRemove = (row: DynamicFilterRow): void => {
        const index = filterSet.rows.indexOf(row);
        filterSet.removeRow(row.id);
        const rows = filterSet.rows;
        const next = rows[index] ?? rows[rows.length - 1];
        setFocusTarget(next ? { kind: "remove", rowId: next.id } : { kind: "add" });
    };

    const handleClear = (): void => {
        filterSet.clear();
        setFocusTarget({ kind: "add" });
    };

    const rows = filterSet.rows;

    return (
        <div className="widget-dynamic-filters">
            {rows.length > 0 && (
                <ul className="dynamic-filters-list">
                    {rows.map(row => (
                        <li
                            key={row.id}
                            className="dynamic-filters-row"
                            ref={el => {
                                if (el) {
                                    rowRefs.current.set(row.id, el);
                                } else {
                                    rowRefs.current.delete(row.id);
                                }
                            }}
                        >
                            <RowControls
                                row={row}
                                filterSet={filterSet}
                                texts={texts}
                                name={props.name}
                                onRemove={() => handleRemove(row)}
                            />
                        </li>
                    ))}
                </ul>
            )}
            <div className="dynamic-filters-actions">
                <button
                    ref={addRef}
                    type="button"
                    className="btn btn-secondary dynamic-filters-add"
                    onClick={handleAdd}
                >
                    {texts.addFilter}
                </button>
                {rows.length > 0 && (
                    <button type="button" className="btn btn-link dynamic-filters-clear" onClick={handleClear}>
                        {texts.clearAll}
                    </button>
                )}
            </div>
        </div>
    );
});

interface RowControlsProps {
    row: DynamicFilterRow;
    filterSet: DynamicFilterSet;
    texts: DynamicFilterBuilderTexts;
    name: string;
    onRemove: () => void;
}

const RowControls = observer(function RowControls(props: RowControlsProps): ReactElement {
    const { row, filterSet, texts } = props;
    const field = filterSet.field(row.fieldKey);
    const removeLabel = field ? `${texts.removeFilter} ${field.label}` : texts.removeFilter;

    return (
        <>
            <button
                type="button"
                className="btn btn-default btn-icon dynamic-filters-remove"
                aria-label={removeLabel}
                title={removeLabel}
                onClick={props.onRemove}
            >
                <span aria-hidden="true">✕</span>
            </button>
            <div className="dynamic-filters-field">
                <FieldPicker row={row} filterSet={filterSet} ariaLabel={texts.fieldPicker} />
            </div>
            <div className="dynamic-filters-value">
                <RowValue
                    key={`${row.id}:${row.fieldKey}`}
                    row={row}
                    name={`${props.name}-row-${row.id}`}
                    label={field?.label ?? ""}
                />
            </div>
        </>
    );
});

const FieldPicker = observer(function FieldPicker(props: {
    row: DynamicFilterRow;
    filterSet: DynamicFilterSet;
    ariaLabel: string;
}): ReactElement {
    const { row, filterSet } = props;
    const options: OptionWithState[] = filterSet.fields.map(f => ({
        caption: f.label,
        value: f.key,
        selected: f.key === row.fieldKey
    }));
    const current = options.find(o => o.selected);

    const useSelectProps = (): UseSelectProps<OptionWithState> => ({
        items: options,
        itemToKey: item => item?.value,
        itemToString: item => item?.caption ?? "",
        selectedItem: current ?? null,
        onSelectedItemChange: ({ selectedItem }) => {
            if (selectedItem) {
                filterSet.setField(row.id, selectedItem.value);
            }
        }
    });

    return (
        <Select
            value={current?.caption ?? ""}
            options={options}
            useSelectProps={useSelectProps}
            clearable={false}
            empty={!current}
            showCheckboxes={false}
            onClear={() => undefined}
            ariaLabel={props.ariaLabel}
        />
    );
});
