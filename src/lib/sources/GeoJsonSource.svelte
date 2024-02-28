<script lang="ts">
  // Cf https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#geojson

  import { getContext, setContext, onDestroy } from "svelte";
  import { omitUndefinedValues } from "../utils";
  import type { FeatureCollection } from "geojson"
  import type { MapContext,SourceContext } from "$lib/context";

  export let mapKey: any;
  export let sourceKey: any;
  export let id: string;
  export let attribution = undefined;
  export let buffer = undefined;
  export let cluster = undefined;
  export let clusterMaxZoom = undefined;
  export let clusterProperties = undefined;
  export let clusterRadius = undefined;
  export let data: FeatureCollection | undefined = undefined; // URL or inline data
  export let generateId = undefined;
  export let lineMetrics = undefined;
  export let maxzoom = undefined;
  export let promoteId = undefined;
  export let tolerance = undefined;


  const mapContext = getContext<MapContext>(mapKey);
  const map = mapContext.getMap();
  const loadedStore = mapContext.getLoadedStore();

  // Remember ID of all <Layer> children, in order to remove them in onDestroy, before removing the source.
  const layers = [];

  setContext<SourceContext>(sourceKey, {
      getSourceId: () => id,
      addChildLayer: (id) => {
          layers.push(id);
      },
  });

  function addSource() {
      const options = omitUndefinedValues({
          attribution,
          buffer,
          cluster,
          clusterMaxZoom,
          clusterProperties,
          clusterRadius,
          data,
          generateId,
          lineMetrics,
          maxzoom,
          promoteId,
          tolerance,
          type: "geojson",
      });
      map.addSource(id, options);
  }

  function handleStyledata() {
      if (!map.getSource(id)) {
          addSource();
      }
  }

  $: if ($loadedStore) {
      const source = map.getSource(id);
      if (source) {
          source.setData(data);
      } else {
          // Add the source before "styledata" event occurs to make it available to child <Layer>.
          addSource();

          // Listen to "styledata" event to re-create the source if the style changes.
          map.on("styledata", handleStyledata);
      }
  }

  onDestroy(() => {
      map.off("styledata", handleStyledata);

      // Remove all <Layer> children of <GeoJSONSource>.
      let layerId;
      while ((layerId = layers.pop())) {
          if (map.getLayer(layerId)) {
              map.removeLayer(layerId);
          }
      }

      if (map.getSource(id)) {
          map.removeSource(id);
      }
  });
</script>

<slot />
