import MapComponent from './MapComponent.svelte'
import { mapKey, sourceKey } from './context'
import Layer from './Layer.svelte'
import GeoJsonSource from './sources/GeoJsonSource.svelte'
import VectorSource from './sources/VectorSource.svelte'


export {
  MapComponent as Map,
  Layer, 
  mapKey, sourceKey, GeoJsonSource, VectorSource
} as default