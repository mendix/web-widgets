import { createInjectionHooks } from "brandi-react";
import { CORE_TOKENS as CORE, GY_TOKENS as GY } from "../tokens";

export const [useGalleryRootVM] = createInjectionHooks(GY.galleryRootVM);
export const [useMainGate] = createInjectionHooks(CORE.mainGate);
