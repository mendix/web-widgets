import { disposeBatch } from "./disposeBatch";
import { SetupComponent } from "./interfaces/SetupComponent";
import { SetupComponentHost } from "./interfaces/SetupComponentHost";

export abstract class SetupHost implements SetupComponentHost {
    private components: Set<SetupComponent> = new Set();
    private isSetupCalled: boolean = false;

    add(component: SetupComponent): void {
        this.components.add(component);
    }

    remove(component: SetupComponent): void {
        this.components.delete(component);
    }

    setup(): () => void {
        if (this.isSetupCalled) {
            throw new Error("setup method has already been called.");
        }
        this.isSetupCalled = true;

        const [add, disposeAll] = disposeBatch();
        for (const controller of this.components) {
            const cleanup = controller.setup?.();
            if (cleanup) {
                add(cleanup);
            }
        }
        return disposeAll;
    }
}
