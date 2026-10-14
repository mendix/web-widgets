// The classic "node" moduleResolution used by this package does not read the
// `exports` subpath map in @tiptap/react's package.json, so the "/menus" entry
// point cannot be resolved by type. Re-export its types from the dist path.
declare module "@tiptap/react/menus" {
    export * from "@tiptap/react/dist/menus";
}
