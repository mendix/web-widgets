export {};

declare global {
    interface Window {
        leafletMapInstance: import("leaflet").Map | null; // Declare the map instance
    }
}
