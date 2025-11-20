import { MultiSelectionService } from "./MultiSelectionService";
import { SingleSelectionService } from "./SingleSelectionService";

export type SelectionHelperService = MultiSelectionService | SingleSelectionService | null;
