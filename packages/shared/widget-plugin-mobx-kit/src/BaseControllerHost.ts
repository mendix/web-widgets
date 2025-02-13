import { disposeBatch } from "./disposeBatch";
import { ReactiveController, ReactiveControllerHost } from "./reactive-controller";

export abstract class BaseControllerHost implements ReactiveControllerHost {
    private controllers: Set<ReactiveController> = new Set();
    private isSetupCalled: boolean = false;

    addController(controller: ReactiveController): void {
        this.controllers.add(controller);
    }

    removeController(controller: ReactiveController): void {
        this.controllers.delete(controller);
    }

    setup(): () => void {
        if (this.isSetupCalled) {
            throw new Error("setup method has already been called.");
        }
        this.isSetupCalled = true;

        const [add, disposeAll] = disposeBatch();
        for (const controller of this.controllers) {
            const cleanup = controller.setup?.();
            if (cleanup) {
                add(cleanup);
            }
        }
        return disposeAll;
    }
}
