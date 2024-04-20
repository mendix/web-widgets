// import {
//     container,
//     ContainerProps,
//     datasource,
//     dropzone,
//     structurePreviewPalette,
//     StructurePreviewProps,
//     TextProps,
//     text,
// } from "@mendix/widget-plugin-platform/preview/";
import { Problem } from "@mendix/pluggable-widgets-tools";
export function check(_: unknown): Problem[] {
    const errors: Problem[] = [];
    return errors;
}

// export function getPreview(
//     values: unknown,
//     isDarkMode: boolean,
//     spVersion: number[] = [0, 0, 0]
// ): StructurePreviewProps | null {
//     retunr
// }

export function getCustomCaption(_: unknown, _platform = "desktop"): string {
    return `<Playground />`;
}
