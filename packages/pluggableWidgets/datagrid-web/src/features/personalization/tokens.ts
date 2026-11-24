import { token } from "brandi";
import type { GridPersonalizationStore } from "./GridPersonalizationStore";

export const PERSONALIZATION_TOKENS = {
    personalizationService: token<GridPersonalizationStore>("GridPersonalizationStore")
};
