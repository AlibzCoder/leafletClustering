import { useEffect, useRef, useState } from "react";
import useSupercluster from "use-supercluster";
import MapComponent, { animateTo } from "./Map";
import { usePoints } from "./usePoints";
import "antd/dist/antd.css";
import DrawerComponent from "./Drawer";





const App = () => {

  const mapRef = useRef();

  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(10);
  const points = usePoints();

  const [nodes, setNodes] = useState(null);

  const { clusters, supercluster } = useSupercluster({
    points: points,
    bounds: bounds,
    zoom: zoom,
    options: { radius: 75, maxZoom: 17 },
  });

  const [isDrawerOpen, openDrawer] = useState(false)
  const [parentCluster, setParentCluster] = useState(null)

  useEffect(() => {
    if (!parentCluster && clusters.length > 0) setParentCluster(clusters);
    // only gets value at init
  }, [clusters,parentCluster])




  const onTreeSelect = key => {
    if(key){
      openDrawer(false)
      animateTo(nodes[key],mapRef.current,supercluster)
    }
    
  }
  


  return <div className="page">

    <div className="open-drawer-button" onClick={() => openDrawer(true)}>
      <img src="/bars.svg" alt='' />
    </div>

    <DrawerComponent {...{
      onTreeSelect,
      supercluster,
      parentCluster,
      isDrawerOpen,
      openDrawer,
      nodes,
      setNodes
    }} />

    <MapComponent {...{
      mapRef,
      clusters,
      supercluster,
      setBounds,
      setZoom,
      pointsLength: points.length
    }} />


  </div>
}

export default App;
