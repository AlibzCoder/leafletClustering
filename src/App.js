import { Map, Marker, TileLayer } from "react-leaflet";
//import Marker from 'react-leaflet-enhanced-marker'
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from "react";
import { getGeJson } from "./loadGeJson";
import useSupercluster from "use-supercluster";
import L from 'leaflet';

const cuffs = new L.Icon({
  iconUrl: "/marker.svg",
  iconSize: [25, 25]
});
const icons = {};
const fetchIcon = (count, size) => {
  if (!icons[count]) {
    icons[count] = L.divIcon({
      html: `<div class="cluster-marker" style="width: ${size}px; height: ${size}px;">
        ${count}
      </div>`
    });
  }
  return icons[count];
};



const App = () => {

  const mapRef = useRef();
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(10);

  const [geJson, setGeJson] = useState(null);
  const [formattedGeJson, setFormattedGeJson] = useState(null);
  useEffect(() => {
    getGeJson().then(setGeJson)
  }, [])//fetch data from api

  useEffect(() => {
    console.log(geJson)
    if (geJson) {
      alert('data loaded')
      setFormattedGeJson(geJson.map(point => ({
        type: "Feature",
        properties: { cluster: false, Id: point.id, category: point.category },
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(point.location.longitude),
            parseFloat(point.location.latitude)
          ]
        }
      })))
    }
  }, [geJson])



  const { clusters, supercluster } = useSupercluster({
    points: formattedGeJson ?? [],
    bounds: bounds,
    zoom: zoom,
    options: { radius: 75, maxZoom: 17 },
  });


  const getBounds = map => {
    let bounds = map.leafletElement.getBounds()
    let nw = bounds.getNorthWest();
    let se = bounds.getSouthEast();
    setBounds([nw.lng, se.lat, se.lng, nw.lat])
  }


  return <div className="page">
    <Map center={[52.6376, -1.135171]} zoom={zoom} zoomControl={false}
      ref={(map) => {
        if (map && !bounds) getBounds(map)
        mapRef.current = map
      }}
      onmove={() => getBounds(mapRef.current)}
      onzoomend={({ target: { _zoom } }) => setZoom(_zoom)}>

      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {clusters.map(cluster => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const {
          cluster: isCluster,
          point_count: pointCount
        } = cluster.properties;


        if (isCluster) {
          return <Marker
            key={`cluster-${cluster.id}`}
            position={[latitude, longitude]}
            icon={fetchIcon(pointCount,
              10 + (pointCount / formattedGeJson.length) * 5
            )}
            onClick={() => {
              const expansionZoom = Math.min(
                supercluster.getClusterExpansionZoom(cluster.id),
                18
              );
              const leaflet = mapRef.current.leafletElement;
              leaflet.setView([latitude, longitude], expansionZoom, {
                animate: true
              });
            }}
          />
        }

        return <Marker
          key={`crime-${cluster.properties.Id}`}
          position={[latitude, longitude]}
          icon={cuffs} />
      })}

    </Map>

  </div>
}

export default App;
