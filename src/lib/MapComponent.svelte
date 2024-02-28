<script lang="ts">
  import { onMount, createEventDispatcher, setContext } from "svelte";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store"
  import { mapKey } from "./context";
  import { omitUndefinedValues } from "./utils";

  import pkg from "mapbox-gl";
  import type {MapMouseEvent, MapboxOptions, LngLatBoundsLike, LngLatLike, DragPanOptions, FitBoundsOptions,InteractiveOptions, TransformRequestFunction } from 'mapbox-gl'
  const { Map, NavigationControl} = pkg


  export let map: pkg.Map | null = null;

  // mapboxgl.Map properties
  export let accessToken: string | undefined;
  export let contextKey: any;

  export let antialias: boolean | undefined = undefined;
  export let attributionControl: boolean | undefined = undefined;
  export let bearing: number | undefined = undefined;
  export let bearingSnap: number | undefined = undefined;
  export let bounds: LngLatBoundsLike | undefined = undefined;
  export let boxZoom: boolean | undefined = undefined;
  export let center: LngLatLike | undefined = undefined;
  export let clickTolerance: number | undefined = undefined;
  export let collectResourceTiming: boolean | undefined = undefined;
  export let crossSourceCollisions: boolean | undefined = undefined;
  export let customAttribution: string | string[] | undefined = undefined;
  export let doubleClickZoom: boolean | undefined = undefined;
  export let dragPan: boolean | DragPanOptions | undefined = undefined;
  export let dragRotate: boolean | undefined = undefined;
  export let fadeDuration: number | undefined = undefined;
  export let failIfMajorPerformanceCaveat: boolean | undefined = undefined;
  export let fitBoundsOptions: FitBoundsOptions | undefined = undefined;
  export let hash: boolean | string | undefined = undefined;
  export let interactive: boolean | undefined = undefined;
  export let keyboard: boolean | undefined = undefined;
  export let locale: { [key: string]: string } | undefined = undefined;
  export let localIdeographFontFamily: string | undefined = undefined;
  export let logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | undefined = undefined;
  export let maxBounds: LngLatBoundsLike | undefined = undefined;
  export let maxPitch: number | undefined = undefined;
  export let maxTileCacheSize: number | undefined = undefined;
  export let maxZoom: number | undefined = undefined;
  export let minPitch: number | undefined = undefined;
  export let minZoom: number | undefined = undefined;
  export let pitch: number | undefined = undefined;
  export let pitchWithRotate: boolean | undefined = undefined;
  export let preserveDrawingBuffer: boolean | undefined = undefined;
  export let refreshExpiredTiles: boolean | undefined = undefined;
  export let renderWorldCopies: boolean | undefined = undefined;
  export let scrollZoom: boolean | InteractiveOptions | undefined = undefined;
  export let style: mapboxgl.Style | string | undefined = undefined;
  export let touchZoomRotate: boolean | InteractiveOptions | undefined = undefined;
  export let trackResize: boolean | undefined = undefined;
  export let transformRequest: TransformRequestFunction | undefined = undefined;
  export let zoom: number | undefined = undefined;
  // <Map> Svelte component properties
  export let loaded: boolean = false;
  export let styleLoaded: boolean = false;



  const loadedStore: Writable<boolean> = writable(false);

  setContext(contextKey, {
      getMap: () => map,
      getLoadedStore: () => loadedStore,
  });

  const dispatch = createEventDispatcher();

  let container: HTMLElement;
  onMount(async () => {
      const options: MapboxOptions = omitUndefinedValues<MapboxOptions>({
          accessToken,
          antialias,
          attributionControl,
          bearing,
          bounds,
          bearingSnap,
          boxZoom,
          center,
          clickTolerance,
          collectResourceTiming,
          container,
          crossSourceCollisions,
          customAttribution,
          doubleClickZoom,
          dragPan,
          dragRotate,
          fadeDuration,
          failIfMajorPerformanceCaveat,
          fitBoundsOptions,
          hash,
          interactive,
          keyboard,
          locale,
          localIdeographFontFamily,
          logoPosition,
          maxBounds,
          maxPitch,
          maxTileCacheSize,
          maxZoom,
          minPitch,
          minZoom,
          pitch,
          pitchWithRotate,
          preserveDrawingBuffer,
          refreshExpiredTiles,
          renderWorldCopies,
          scrollZoom,
          style,
          touchZoomRotate,
          trackResize,
          transformRequest,
          zoom,
      });

      map = new Map({...options, 
        accessToken: options.accessToken || getAccessTokenFromEnv()
      });

      function updateGeoState() {
          if (map) {
              bearing = map.getBearing();
              center = map.getCenter();
              pitch = map.getPitch();
              zoom = map.getZoom();
          }
      }


      // Events
      // Cf https://docs.mapbox.com/mapbox-gl-js/api/#map

      function handleClick(event) {
          dispatch("click", event);
      }

      function handleData(event) {
          styleLoaded = map.isStyleLoaded();
          dispatch("data", event);
      }

      function handleLoad(event) {
          loaded = true;
          $loadedStore = true;
          updateGeoState();
          dispatch("load", event);
      }

      function handleMove(event: MapMouseEvent) {
          dispatch("move", event);
      }

      function handleMoveEnd(event: MapMouseEvent) {
          updateGeoState();
          dispatch("moveend", event);
      }

      map.on("click", handleClick);
      map.on("data", handleData);
      map.on("load", handleLoad);
      map.on("move", handleMove);
      map.on("moveend", handleMoveEnd);

      map.addControl(new NavigationControl());

      // TODO forward all events
      // Cf https://docs.mapbox.com/mapbox-gl-js/api/#map.event:resize

      return () => {
          if (map) {
              map.off("click", handleClick);
              map.off("data", handleData);
              map.off("load", handleLoad);
              map.off("move", handleMove);
              map.off("moveend", handleMoveEnd);
              map.remove();
          }
      };
  });

  $: if (map && style) {
      map.setStyle(style);
  }

  $: if (map && center) {
      map.setCenter(center);
  }



/**
 * Access token can be provided via one of:
 *   mapboxAccessToken prop
 *   access_token query parameter
 *   MapboxAccessToken environment variable
 *   REACT_APP_MAPBOX_ACCESS_TOKEN environment variable
 * @returns access token
 */
function getAccessTokenFromEnv(): string {
  let accessToken = null;

  // Note: This depends on bundler plugins (e.g. webpack) importing environment correctly
  try {
    accessToken = accessToken || process.env.MAPBOX_ACCESS_TOKEN;
  } catch {
    // ignore
  }

  return accessToken;
}

</script>

<div bind:this={container}>
  {#if map}
      <slot />
  {/if}
</div>

<style>
  div {
      width: 100%;
      height: 100%;
  }
</style>
