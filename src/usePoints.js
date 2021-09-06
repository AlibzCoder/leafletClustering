import { useEffect, useState } from "react";
import { getGeJson } from "./loadGeJson";

const pointFormat = point => ({
    type: "Feature",
    properties: { cluster: false, Id: point.id, category: point.category },
    geometry: {
        type: "Point",
        coordinates: [
            parseFloat(point.location.longitude),
            parseFloat(point.location.latitude)
        ]
    }
})

export const usePoints = () => {
    const [geJson, setGeJson] = useState(null);
    const [formattedGeJson, setFormattedGeJson] = useState([]);

    useEffect(() => getGeJson().then(setGeJson), [])//fetch data from api

    useEffect(() => {
        if (geJson) 
            setFormattedGeJson(geJson.map(pointFormat))
    }, [geJson])

    return formattedGeJson;
}