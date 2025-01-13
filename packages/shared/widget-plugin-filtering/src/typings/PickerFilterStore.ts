import { RefFilterStore } from "../stores/RefFilterStore";
import { StaticSelectFilterStore } from "../stores/picker/StaticSelectFilterStore";

export type PickerFilterStore = RefFilterStore | StaticSelectFilterStore;
