import copyFiles from "@mendix/rollup-web-widgets/copyFiles.mjs";
import { withSharedLibs } from "@mendix/rollup-web-widgets/sharedLibs.mjs";

export default args => withSharedLibs(args, copyFiles(args), ["mobx"]);
