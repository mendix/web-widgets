import { ObjectItem } from "mendix";
import { ColumnsType } from "../../../typings/DatagridProps";

export type Action =
    | DataSourceUpdate
    | {
          type: "Setup";
          payload: { callback: CallbackFunction; columns: ColumnsType[]; limit: number };
      }
    | {
          type: "ColumnsUpdate";
          payload: { columns: ColumnsType[] };
      }
    | {
          type: "Start";
      }
    | {
          type: "Reset";
      }
    | {
          type: "PageExported";
      }
    | {
          type: "ColumnsExported";
      }
    | {
          type: "Finish";
      }
    | {
          type: "Abort";
      }
    | {
          type: "ExportEnd";
      };

interface BaseState {
    currentOffset: number;
    currentItems: ObjectItem[];
    currentLimit: number;
    hasMoreItems: boolean;
}

export type CallbackFunction = (msg: Message) => Promise<void> | void;

export type ColumnDefinition = {
    name: string;
    type: string;
};

export type DataGridName = string;

interface DataSourceStateSnapshot {
    items: ObjectItem[];
    offset: number;
    limit: number;
}

export type DataSourceUpdate = {
    type: "DataSourceUpdate";
    payload: { offset: number; items: ObjectItem[]; hasMoreItems: boolean; limit: number };
};

export interface InitState extends BaseState {
    callback: null;
    columns: ColumnsType[] | null;
    exporting: false;
    phase: "awaitingCallback";
    processedRows: number;
    snapshot: null;
}

export type Message =
    | {
          type: "columns";
          payload: ColumnDefinition[];
      }
    | {
          type: "data";
          payload: RowDataType[][];
      }
    | {
          type: "end";
      }
    | {
          type: "aborted";
      };

type RowDataType = string | number | boolean;

interface ReadyState extends BaseState {
    callback: CallbackFunction;
    columns: ColumnsType[];
    exporting: false;
    phase: "readyToStart";
    processedRows: number;
    snapshot: DataSourceStateSnapshot;
}

export type State = WorkingState | ReadyState | InitState;

export type UpdateDataSourceFn = (params: { offset?: number; limit?: number; reload?: boolean }) => void;

interface WorkingState extends BaseState {
    callback: CallbackFunction;
    columns: ColumnsType[];
    exporting: true;
    phase: "resetOffset" | "exportColumns" | "awaitingData" | "exportData" | "finished" | "aborting" | "finally";
    processedRows: number;
    snapshot: DataSourceStateSnapshot;
}
