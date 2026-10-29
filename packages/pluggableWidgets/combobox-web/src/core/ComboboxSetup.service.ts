import { SetupHost } from "@mendix/widget-plugin-mobx-kit/SetupHost";

/** Host for the parts of the core that own a lifecycle (`setup()` on mount, disposer on unmount). */
export class ComboboxSetupService extends SetupHost {}
