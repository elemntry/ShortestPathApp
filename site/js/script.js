//create an array with nodes
var nodes = new vis.DataSet([
    {id: "1", label: "Node 1"},
    {id: "2", label: "Node 2"},
    {id: "3", label: "Node 3"},
    {id: "4", label: "Node 4"},
    {id: "5", label: "Node 5"},
]);

// create an array with edges
var edges = new vis.DataSet([
    {from: "1", to: "3"},
    {from: "1", to: "2"},
    {from: "2", to: "4"},
    {from: "2", to: "5"},
    {from: "3", to: "3"},
]);
//color of nodes
let bg = "#277DA1";
let hlBg = "#577590";
let startNodeBg = "#04bd00";
let startNodeHlBg = "#04bd00";
let endNodeBg = "#F94144";
let endNodeHlBg = "#F94144";
let fontColor = "#FFFFFF";
// create a network
var container = document.getElementById("mynetwork");
var data = {
    nodes: nodes,
    edges: edges,
};
var options = {
    interaction: {
        selectConnectedEdges: true,
    },
    nodes: {
        color: {
            background: bg,
            highlight: hlBg,
        },
        font: {
            color: fontColor,
        },
    },
    edges: {
        arrows: {
            to: {
                enabled: false,
            },
        },
        selectionWidth: function (width) {
            return width * 4;
        },
    },
    locale: "ru",
    manipulation: {
        addNode: function (data, callback) {
            // filling in the popup DOM elements
            document.getElementById("node-operation").innerHTML = "Добавить узел";
            editNode(data, clearNodePopUp, callback);
        },
        editNode: function (data, callback) {
            // filling in the popup DOM elements
            document.getElementById("node-operation").innerHTML =
                "Редактировать узел";
            editNode(data, cancelNodeEdit, callback);
        },
        addEdge: function (data, callback) {
            if (data.from == data.to) {
                var r = confirm("Вы действительно хотите сделать циклический путь?");
                if (r != true) {
                    callback(null);
                    return;
                }
            }
            document.getElementById("edge-operation").innerHTML = "Добавить ребро";
            editEdgeWithoutDrag(data, callback);
        },
        editEdge: {
            editWithoutDrag: function (data, callback) {
                document.getElementById("edge-operation").innerHTML =
                    "Редактировать ребро";
                editEdgeWithoutDrag(data, callback);
            },
        },
        deleteNode: onDelete,
    },
};

function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function onDelete(toBeDeletedData, callback) {
    // toBeDeletedData is object with nodes: [] and edges: []
    callback(toBeDeletedData);
    routeFromTo.length = 0;
    nodes.forEach((node) =>
        nodes.update([
            {
                id: node.id,
                color: {background: bg, highlight: hlBg},
            },
        ])
    );
}

function editNode(data, cancelAction, callback) {
    document.getElementById("node-label").value = data.label;
    document.getElementById("node-saveButton").onclick = saveNodeData.bind(
        this,
        data,
        callback
    );
    document.getElementById("node-cancelButton").onclick = cancelAction.bind(
        this,
        callback
    );
    document.getElementById("node-popUp").style.display = "block";
}

// Callback passed as parameter is ignored
function clearNodePopUp() {
    document.getElementById("node-saveButton").onclick = null;
    document.getElementById("node-cancelButton").onclick = null;
    document.getElementById("node-popUp").style.display = "none";
}

function cancelNodeEdit(callback) {
    clearNodePopUp();
    callback(null);
}

function saveNodeData(data, callback) {
    data.label = document.getElementById("node-label").value;
    clearNodePopUp();
    callback(data);
}

function editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    document.getElementById("edge-label").value = data.label;
    document.getElementById("edge-saveButton").onclick = saveEdgeData.bind(
        this,
        data,
        callback
    );
    document.getElementById("edge-cancelButton").onclick = cancelEdgeEdit.bind(
        this,
        callback
    );
    document.getElementById("edge-popUp").style.display = "block";
}

function clearEdgePopUp() {
    document.getElementById("edge-saveButton").onclick = null;
    document.getElementById("edge-cancelButton").onclick = null;
    document.getElementById("edge-popUp").style.display = "none";
}

function cancelEdgeEdit(callback) {
    clearEdgePopUp();
    callback(null);
}

function saveEdgeData(data, callback) {
    if (typeof data.to === "object") data.to = data.to.id;
    if (typeof data.from === "object") data.from = data.from.id;
    data.label = document.getElementById("edge-label").value;
    clearEdgePopUp();
    callback(data);
}

let network = new vis.Network(container, data, options);

//
//custom
//

//change graph view(directed or undirected)
document.getElementById("isDirected").addEventListener("change", function () {
    if (this.checked) {
        let opt = {
            edges: {
                arrows: {
                    to: {
                        enabled: true,
                    },
                },
            },
        };

        network.setOptions(opt);
        network.redraw();
    } else if (!this.checked) {
        let opt = {
            edges: {
                arrows: {
                    to: {
                        enabled: false,
                    },
                },
            },
        };
        network.setOptions(opt);
        network.redraw();
    }
});

//remove graph
document.getElementById("remove-graph").addEventListener(
    "click",
    () => {
        clearGraph();
        checkAllRouteNodesCheck();
        document.getElementById('draw-path').disabled = true;
        let nodeSpan = document.querySelectorAll(".path-info__node");
        nodeSpan.forEach((el) => (el.textContent = ""));
    },
    false
);

function clearGraph() {
    // remove all nodes and edges
    nodes.forEach((node) => nodes.remove(nodes.get(node)));
    edges.forEach(edge => edges.remove([edge.id]));
    routeFromTo = [];
}

//select only two nodes. Route from start node(green label) to end node(red label)
network.on("selectNode", function (params) {
    addToRoute(params.nodes[0]);
});

var routeFromTo = [];

// add node to arr route
function addToRoute(node) {
    switch (routeFromTo.length) {
        case 0:
            //mark as green
            nodes.update([
                {
                    id: node,
                    color: {background: startNodeBg, highlight: startNodeHlBg},
                },
            ]);
            routeFromTo.push(node);
            break;
        case 1:
            if (routeFromTo[0] === node) {
                //mark as red
                nodes.update([
                    {
                        id: node,
                        color: {
                            background: startNodeBg,
                            highlight: startNodeHlBg,
                        },
                    },
                ]);
            } else {
                nodes.update([
                    {
                        id: node,
                        color: {
                            background: endNodeBg,
                            highlight: endNodeHlBg,
                        },
                    },
                ]);
            }
            routeFromTo.push(node);
            break;
        default:
            // very strange logic
            nodes.update([
                {
                    id: routeFromTo[1],
                    color: {background: bg, highlight: hlBg},
                },
                {
                    id: routeFromTo[0],
                    color: {background: startNodeBg, highlight: startNodeHlBg},
                },
            ]);
            routeFromTo.pop();
            if (routeFromTo[0] === node) {
                //mark previous as green
                nodes.update([
                    {
                        id: node,
                        color: {
                            background: startNodeBg,
                            highlight: startNodeHlBg,
                        },
                    },
                ]);

                routeFromTo.push(node);
            } else {
                //mark as red
                nodes.update([
                    {
                        id: node,
                        color: {
                            background: endNodeBg,
                            highlight: endNodeHlBg,
                        },
                    },
                ]);
                routeFromTo.push(node);
            }
            break;
    }
}

//deselect route nodes. If click on blank place, nodes was deselected
network.on("click", function (params) {
    let resultDist = document.querySelector('.path-info__result_dist')
    let fromNodeSpan = document.querySelector(".path-info__node_from");
    let toNodeSpan = document.querySelector(".path-info__node_to");
    document.getElementById('draw-path').disabled = true;
    if (params.nodes.length === 0 && params.edges.length === 0) {
        nodes.forEach((node) => {
            nodes.update([
                {
                    id: node.id,
                    color: {background: bg, highlight: hlBg},
                },
            ]);
            routeFromTo.length = 0;
            fromNodeSpan.textContent = toNodeSpan.textContent = resultDist.textContent = "";
        });
    }
    if (params.nodes.length > 0) {
        fromNodeSpan.textContent = nodes.get(routeFromTo[0]).label;
        toNodeSpan.textContent = routeFromTo[1]
            ? nodes.get(routeFromTo[1]).label
            : "не задана конечная вершина";
    }
});

// check if all nodes are selected to find. if dalse button find route must be disabled
function checkAllRouteNodesCheck() {
    document.getElementById("sendrequest").disabled = routeFromTo.length !== 2;
}

document.addEventListener("click", () => checkAllRouteNodesCheck());

// For request
//query to azure func
let res;
document.getElementById("sendrequest").addEventListener("click", (e) => {
    network.unselectAll();

    async function postData(url = "", data = {}) {
        const response = await fetch(url, {
            method: "POST", // GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        console.log("request:", data);
        return await response.json();
    }

    //collect data nodes and edges
    const request = {
        graph: {
            nodes: nodes.map(node => ({
                id: node.id,
                label: node.label,
            })),
            edges: edges.map(edge => ({
                id: edge.id,
                from: edge.from,
                to: edge.to,
                weight: (edge.label) ? edge.label : "1",
            })),
            selectedNodes: routeFromTo,
            directed: document.getElementById('isDirected').checked,
        },
    };
    //send request
    
    postData("http://localhost:7071/api/FindShortestPath", request)
        .then(responce => {
            //for test
            console.log('responce ', responce);
            let distResult = responce.resultNodes.find(node => node.id === responce.fromToNodesIds[1]).dist;
            //for test
            console.log('Shortest path distance: ', distResult);
            insertFindShortestPathResult(distResult);
            document.getElementById('draw-path').disabled = false;
            res= responce;
        })
        .catch(error => console.log('error', error));
});

function insertFindShortestPathResult(dist) {
    let res = document.querySelector('.path-info__result_dist');
    res.textContent = (dist == 2147483647) ? 'Недоступен' : dist;
}

// draw path    
    document.querySelector('#draw-path').addEventListener('click', () => {
        network.unselectAll();        
            let pathArrEdges = [];
            let endNode = res.resultNodes.find(node => node.id === res.fromToNodesIds[1]);
            let flagEndRoute = true;
            while (flagEndRoute) {
                if (endNode.prevNodeId === null) flagEndRoute = false;
                let edgeToSelect;
                edges.forEach(edge => {
                    if (((edge.from === endNode.id) && (edge.to === endNode.prevNodeId)) ||
                        ((edge.from === endNode.prevNodeId) && (edge.to == endNode.id))) {
                        edgeToSelect = edge;
                    }
                });
                if (edgeToSelect) {
                    // for test
                    console.log(edgeToSelect.id);
                    pathArrEdges.unshift(edgeToSelect.id);
                    endNode = res.resultNodes.find(node => node.id === endNode.prevNodeId);
                }
            }
            let edgesToDraw = [];
            const INTERVAL = 1000;
            pathArrEdges.forEach((edge, index) => {
                setTimeout(() => {
                    console.log('edge', edge);
                    edgesToDraw.push(edge);
                    network.selectEdges(edgesToDraw);
                }, INTERVAL * index);
            });


        }
    )

