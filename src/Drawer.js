import { Drawer, Tree } from "antd";
import React, { useEffect, useState } from "react";


function updateTreeData(list, key, children) {
    return list.map((node) => {
        if (node.key === key) {
            return { ...node, children };
        }

        if (node.children) {
            return { ...node, children: updateTreeData(node.children, key, children) };
        }

        return node;
    });
}
const DrawerComponent = ({ onTreeSelect, supercluster, parentCluster, isDrawerOpen, openDrawer, nodes, setNodes }) => {


    const [treeData, setTreeData] = useState(null);

    const formatClustersToTreeNode = React.useCallback(clusters => {
        let n = nodes;
        let formatted = clusters.map(cluster => {
            let { properties: { cluster: isCluster, cluster_id, Id, point_count_abbreviated } } = cluster;

            let node = {}
            node[isCluster ? cluster_id : Id] = cluster;
            n = { ...n, ...node }

            let item = {
                title: isCluster ? point_count_abbreviated : 'point',
                key: isCluster ? cluster_id : Id,
                isLeaf: !isCluster,
            }
            if (item.isLeaf) item['switcherIcon'] = <img style={{ width: '0.85em', transform: 'translateY(-10%)' }} src="/marker.svg" alt='' />

            return item
        })
        setNodes(n)
        return formatted;
    }, [nodes,setNodes]);

    const onLoadData = ({ key, children }) =>
        new Promise((resolve) => {
            if (children) {
                resolve();
                return;
            }

            setTreeData((origin) =>
                updateTreeData(origin, key,
                    formatClustersToTreeNode(supercluster.getChildren(key))),
            );
            resolve();
        });



    useEffect(() => {
        if (parentCluster&&!treeData) setTreeData(formatClustersToTreeNode(parentCluster))
    }, [parentCluster, formatClustersToTreeNode,treeData])



    return <Drawer
        placement={'left'}
        closable={false}
        onClose={() => openDrawer(false)}
        visible={isDrawerOpen}
    >
        <Tree
            loadData={onLoadData}
            treeData={treeData}
            onSelect={([key]) => onTreeSelect(key)}
            showLine={{ showLeafIcon: true }} />
    </Drawer>
}


export default DrawerComponent;