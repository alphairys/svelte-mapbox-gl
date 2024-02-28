<script lang="ts">
  import { onMount } from 'svelte';
  import  {Map} from '@irys/svelte-mapbox-gl'

  const mapKey = {}
  let center = { lat: 40.72, lon: -73.98}
  let zoom = 14 


  // Your Mapbox access token
  const ACCESS_TOKEN = 'pk.eyJ1IjoiYWxwaGFpcnlzIiwiYSI6ImNqeWdwY3NoZDAzaW8zbXFnYzlobmVnMmEifQ.fiJAdKIAD7zjsEofhykWFw';

  
</script>
<div id="map-container">
  <Map
    contextKey={mapKey}
    accessToken={ACCESS_TOKEN}
    style="mapbox://styles/mapbox/satellite-streets-v11"
    {center}
    zoom={zoom}
  >
  </Map>
</div>
<style>
  /* Ensure the map container fills the parent */
  :global(.mapboxgl-canvas) {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

  #map-container {
    height: 100vh;
    width: 100vw;
  }

</style>