import Quill from "quill";
import TableHeader from "./formats/header";
import TableList, { ListContainer } from "./formats/list";
import { TableBody, TableCell, TableCellBlock, TableColgroup, TableContainer, TableRow } from "./formats/table";
import QuillTableBetter from "./quill-table-better";
import CellSelection from "./ui/cell-selection";
import TableMenus from "./ui/table-menus";

export interface CorrectBound {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width?: number;
    height?: number;
}

export interface Props {
    [propName: string]: string;
}

export interface Range {
    index: number;
    length: number;
}

export type InsertTableHandler = (rows: number, columns: number) => void;

export type TableCellAllowedChildren = TableCellBlock | TableHeader | ListContainer;
export type TableCellChildren = TableCellAllowedChildren | TableList;
export type TableCellMap = Map<string, HTMLElement[]>;

export type UseLanguageHandler = (name: string) => string;

interface BindingObject extends Partial<Omit<Context, "prefix" | "suffix" | "format">> {
    key: number | string | string[];
    shortKey?: boolean | null;
    shiftKey?: boolean | null;
    altKey?: boolean | null;
    metaKey?: boolean | null;
    ctrlKey?: boolean | null;
    prefix?: RegExp;
    suffix?: RegExp;
    format?: Record<string, unknown> | string[];
    handler?: (
        this: { quill: Quill },
        range: Range,
        // eslint-disable-next-line no-use-before-define
        curContext: Context,
        // eslint-disable-next-line no-use-before-define
        binding: NormalizedBinding
    ) => boolean | void;
}

interface Context {
    collapsed: boolean;
    empty: boolean;
    offset: number;
    prefix: string;
    suffix: string;
    format: Record<string, unknown>;
    event: KeyboardEvent;
    line: TableCellChildren;
}

interface NormalizedBinding extends Omit<BindingObject, "key" | "shortKey"> {
    key: string | number;
}

export type {
    BindingObject,
    CellSelection,
    Context,
    ListContainer,
    QuillTableBetter,
    TableBody,
    TableCell,
    TableCellBlock,
    TableColgroup,
    TableContainer,
    TableHeader,
    TableList,
    TableMenus,
    TableRow
};
