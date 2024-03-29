<script lang="ts">
  import { createEventDispatcher, getContext, onDestroy } from "svelte";
  import { omitUndefinedValues } from "./utils";
  import type { AnyLayout, Map, MapLayerEventType, EventData, AnyPaint } from "mapbox-gl"
  import type { MapContext,SourceContext } from "$lib/context";


  type MapLayerEventHandler = (ev: MapLayerEventType[T] & EventData) => void; 

  export let mapKey: any;
  export let sourceKey: any;
  export let type: string;
  export let id: string | undefined;
  export let filter:  any[] | boolean | null | undefined = undefined;
  export let layout: AnyLayout | undefined = undefined;
  export let maxzoom: number | undefined = undefined;
  export let metadata = undefined;
  export let minzoom: number | undefined = undefined;
  export let paint: AnyPaint | undefined = undefined;
  export let sourceLayer: string | undefined = undefined;

  const mapContext = getContext<MapContext>(mapKey);
  const map: Map = mapContext.getMap();
  const loadedStore = mapContext.getLoadedStore();

  const sourceContext = getContext<SourceContext>(sourceKey);
  const sourceId = sourceContext.getSourceId();


  const dispatch = createEventDispatcher();

  $: if (!id) {
      id = sourceId
  }

  // Cf https://docs.mapbox.com/mapbox-gl-js/api/#map#on
  const eventNames: (keyof MapLayerEventType)[]= [
      "mousedown",
      "mouseup",
      "click",
      "dblclick",
      "mousemove",
      "mouseenter",
      "mouseleave",
      "mouseover",
      "mouseout",
      "contextmenu",
      "touchstart",
      "touchend",
      "touchcancel",
  ];

  function addLayer() {
      const options = omitUndefinedValues({
          id,
          layout,
          filter: filter || undefined, // `null` is not accepted as an option
          maxzoom,
          metadata,
          minzoom,
          paint,
          source: sourceId,
          "source-layer": sourceLayer,
          type,
      });
      map.addLayer(options);
  }

  function handleStyledata() {
      // Check that source is defined, because many "styledata" events are triggered,
      // and source is not defined when the first one occurs.
      if (!map.getLayer(id) && map.getSource(sourceId)) {
          addLayer();
      }
  }

  const eventHandlers = {};

  $: if ($loadedStore) {
      const layer = map.getLayer(id);
      if (layer) {
          map.setFilter(id, filter);
          map.setLayerZoomRange(id, minzoom || 0, maxzoom || 24);
          for (const [name, value] of Object.entries(layout || {})) {
              map.setLayoutProperty(id, name, value);
          }
          for (const [name, value] of Object.entries(paint || {})) {
              map.setPaintProperty(id, name, value);
          }
      } else {
          addLayer();
          // Listen to "styledata" event to re-create the layer if the style changes.
          map.on("styledata", handleStyledata);

          // Forward events related to this layer.
          for (const eventName of eventNames) {
              const eventHandler = (ev: MapLayerEventType & EventData) => {
                  dispatch(eventName, ev);
              };
              map.on(eventName, id, eventHandler);
              eventHandlers[eventName] = eventHandler;
          }

          sourceContext.addChildLayer(id);
      }
  }

  onDestroy(() => {
      // Unregister events registered by this layer to avoid multiplicating callbacks.
      map.off("styledata", handleStyledata);
      for (const eventName of eventNames) {
          map.off(eventName, id, eventHandlers[eventName]);
      }

      // If <Layer> is child of <Source>, the layer will have been removed by the onDestroy of <Source>.
      // The following statement ensures layer is removed in other cases.
      if (map.getLayer(id)) {
          map.removeLayer(id);
      }
  });
</script>
