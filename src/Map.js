import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { Map, Marker, TileLayer } from "react-leaflet";

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

export const animateTo = (cluster, map, supercluster) => {
    const [longitude, latitude] = cluster.geometry.coordinates;
    const leaflet = map.leafletElement;
    if(cluster.properties.cluster){
        const expansionZoom = Math.min(
            supercluster.getClusterExpansionZoom(cluster.id),
            18
        );
        leaflet.setView([latitude, longitude], expansionZoom, {
            animate: true
        });
    }else{
        leaflet.flyTo([latitude,longitude], 18)
    }
}


const RenderMarks = ({ clusters, supercluster, pointsLength, mapRef }) => {
    return clusters.map(cluster => {
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
                    10 + (pointCount / pointsLength) * 5
                )}
                onClick={() => animateTo(cluster, mapRef.current, supercluster)}
            />
        }

        return <Marker
            key={`crime-${cluster.properties.Id}`}
            position={[latitude, longitude]}
            icon={cuffs} />
    })
}

const MapComponent = React.memo(({ setBounds, setZoom, clusters, supercluster, pointsLength, mapRef }) => {

    const [bounds, stBounds] = useState(null);
    useEffect(() => setBounds(bounds), [bounds])
    const getBounds = map => {
        let bounds = map.leafletElement.getBounds()
        let nw = bounds.getNorthWest();
        let se = bounds.getSouthEast();
        stBounds([nw.lng, se.lat, se.lng, nw.lat])
    }

    return <Map center={[52.6376, -1.135171]} zoom={10} zoomControl={false}
        ref={(map) => {
            //get bounds when map initializes
            if (map && !bounds) getBounds(map)
            mapRef.current = map
        }}
        onmove={() => getBounds(mapRef.current)}
        onzoomend={({ target: { _zoom } }) => setZoom(_zoom)}>

        <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <RenderMarks {...{ clusters, supercluster, pointsLength, mapRef }} />

    </Map>
}, (pp, np) => !(!(pp.clusters.length === np.clusters.length) || !(pp.pointsLength === np.pointsLength)))
// update component if clusters length or pointsLength is diffrent

export default MapComponent;