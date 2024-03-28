import { AssociationOptionsProvider } from "../AssociationOptionsProvider";

export class AssociationPreviewOptionsProvider extends AssociationOptionsProvider {
    getAll(): string[] {
        return ["..."];
    }
}
