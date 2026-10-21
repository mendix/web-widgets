import type { Version } from "../../../version.ts";
import type { ModuleChangelogFile } from "../../types.ts";

declare interface Location {
    line: number;
    column: number;
    offset: number;
}

declare interface LocationRange {
    start: Location;
    end: Location;
}

export declare class SyntaxError {
    line: number;
    column: number;
    offset: number;
    location: LocationRange;
    expected: any[];
    found: any;
    name: string;
    message: string;
}

declare interface Options {
    moduleName: string;
    Version: typeof Version;
}

export declare function parse(fileContent: string, options: Options): ModuleChangelogFile;
