import { RefFilterStore } from "../stores/picker/RefFilterStore";
import { StaticSelectFilterStore } from "../stores/picker/StaticSelectFilterStore";

export type PickerFilterStore = RefFilterStore | StaticSelectFilterStore;
