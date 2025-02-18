// import {TableCell, TableRow, TableBody, TableContainer} from "quill/formats/table";

// const ATTRIBUTES = ["colspan", "height", "width", "class", "id"];

// type tableCellAttributes = {
//     id?: string;
//     colspan?: string;
//     class?: string;
//     height?: string;
//     width?: string;
// };

// class MxTableCell extends TableCell {
//     static create(value: unknown): HTMLElement {
//         const domNode = super.create(value as string) as HTMLElement;
//         if (value as tableCellAttributes) {
//             const cellAttr = value as tableCellAttributes;
//             // for each tableCellAttributes type
//             if (cellAttr.id) {
//                 domNode.setAttribute("id", cellAttr.id);
//             }
//             if (cellAttr.class) {
//                 domNode.setAttribute("class", cellAttr.class);
//             }
//             if (cellAttr.width) {
//                 domNode.setAttribute("width", cellAttr.width);
//             }
//             if(cellAttr.height){
//                 domNode.setAttribute("height", cellAttr.height);
//             }
//             if (cellAttr.colspan) {
//                 domNode.setAttribute("colspan", cellAttr.colspan);
//             }
//         }
//         return domNode;
//     }

//     static formats(domNode: Element): Record<string, string | null> {
//         return ATTRIBUTES.reduce((formats: Record<string, string | null>, attribute) => {
//             if (domNode.hasAttribute(attribute)) {
//                 formats[attribute] = domNode.getAttribute(attribute);
//             }
//             return formats;
//         }, {});
//     }
// }

// export {MxTableCell};

// // export default class CustomLink extends Link {
// //     format(name: string, value: unknown): void {
// //         if (name !== this.statics.blotName || !value) {
// //             super.format(name, value);
// //         } else if ((value as linkConfigType)?.href !== undefined) {
// //             const linkConfig = value as linkConfigType;
// //             // @ts-expect-error the constructor is generic function, ts will consider sanitize not exist
// //             this.domNode.setAttribute("href", getLink(this.constructor.sanitize(linkConfig.href)));
// //             this.domNode.setAttribute("target", linkConfig.target ?? "_blank");
// //             this.domNode.setAttribute("title", linkConfig.title ?? "");
// //             this.domNode.textContent = linkConfig.text ?? linkConfig.href;
// //         } else {
// //             // @ts-expect-error the constructor is generic function, ts will consider sanitize not exist
// //             this.domNode.setAttribute("href", getLink(this.constructor.sanitize(value)));
// //         }
// //     }

// //     static create(value: unknown): HTMLElement {
// //         if ((value as linkConfigType)?.href !== undefined) {
// //             const linkConfig = value as linkConfigType;
// //             const node = super.create(linkConfig.href) as HTMLElement;
// //             node.setAttribute("href", getLink(this.sanitize(linkConfig.href)));
// //             node.setAttribute("rel", "noopener noreferrer");
// //             node.setAttribute("title", linkConfig.title ?? linkConfig.href);
// //             node.setAttribute("target", linkConfig.target || "_blank");
// //             return node;
// //         } else {
// //             // @ts-expect-error type mismatch expected
// //             return super.create(value);
// //         }
// //     }
// // }
