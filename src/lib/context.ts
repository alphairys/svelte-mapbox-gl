import type { Map } from "mapbox-gl";
import type { Writable } from "svelte/store"

export interface MapContext  {
    getMap: () => Map;
    getLoadedStore: () => Writable<boolean>;
}

export interface SourceContext {
    getSourceId: () => string;
    addChildLayer: (id: string) => void; 
}

export const mapKey = {}
export const sourceKey = {}
