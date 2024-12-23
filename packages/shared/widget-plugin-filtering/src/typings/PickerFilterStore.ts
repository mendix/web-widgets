import { RefFilterStore } from "../stores/RefFilterStore";
import { StaticSelectFilterStore } from "../stores/StaticSelectFilterStore";

export type PickerFilterStore = RefFilterStore | StaticSelectFilterStore;
