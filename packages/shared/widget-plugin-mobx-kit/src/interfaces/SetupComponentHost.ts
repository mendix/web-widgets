import { SetupComponent } from "./SetupComponent";

export interface SetupComponentHost {
    add(component: SetupComponent): void;
    remove(component: SetupComponent): void;
    setup(): () => void;
}
