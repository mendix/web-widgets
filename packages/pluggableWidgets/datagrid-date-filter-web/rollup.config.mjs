import { withSharedLibs } from "@mendix/rollup-web-widgets/sharedLibs.mjs";

export default args => withSharedLibs(args, args.configDefaultConfig);
