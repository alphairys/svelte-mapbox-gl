import type { FeatureCollection, Geometry } from "geojson";
import type { LngLatLike } from "mapbox-gl";
import * as turf from '@turf/turf';

export function coordinatesAtClick(coordinates, { lng }) {
    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    let newLng = coordinates[0]
    while (Math.abs(lng - newLng) > 180) {
        newLng += lng > newLng ? 360 : -360;
    }
    return [newLng, coordinates[1]]
}


export function getCenter(fc: FeatureCollection): LngLatLike {
    const c = turf.centroid(fc).geometry.coordinates;
    return { lng: c[0], lat: c[1] }
}

export function omitUndefinedValues<T>(object) {
  const result = {};
  for (const key in object) {
      if (object[key] !== undefined) {
          result[key] = object[key];
      }
  }
  return result as T;
}