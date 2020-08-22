function getScaleFreeNetwork(nodeCount) {
    var nodes = new vis.DataSet([]);
    var edges = new vis.DataSet([]);
    var connectionCount = [];

    // randomly create some nodes and edges
    for (var i = 0; i < nodeCount; i++) {
        nodes.add({
            id: String(i),
            label: String(i),
        });

        connectionCount[i] = 0;

        // create edges in a scale-free-network way
        if (i === 1) {
            var from = i;
            var to = 0;
            edges.add({
                from: from,
                to: to,
            });
            connectionCount[from]++;
            connectionCount[to]++;
        } else if (i > 1) {
            var conn = edges.length * 2;
            var rand = Math.floor(seededRandom() * conn);
            var cum = 0;
            var j = 0;
            while (j < connectionCount.length && cum < rand) {
                cum += connectionCount[j];
                j++;
            }

            var from = i;
            var to = j;
            edges.add({
                from: from,
                to: to,
            });
            connectionCount[from]++;
            connectionCount[to]++;
        }
    }
    return {nodes: nodes, edges: edges};
}

var seededRandom = vis.util.Alea("SEED");
var nodes = null;
var edges = null;
var network = null;
// randomly create some nodes and edges
var data = getScaleFreeNetwork(15);
var seed = 2;

function setDefaultLocale() {
    var defaultLocal = navigator.language;
    var select = document.getElementById("locale");
    select.selectedIndex = 9; // set fallback value RUSSIAN
    for (var i = 0, j = select.options.length; i < j; ++i) {
        if (select.options[i].getAttribute("value") === defaultLocal) {
            select.selectedIndex = i;
            break;
        }
    }
}

function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function draw() {
    destroy();
    nodes = new vis.DataSet([]);
    edges = new vis.DataSet([]);
    // create a network
    var container = document.getElementById("mynetwork");
    var options = {
        interaction: {
            // multiselect: true,
            selectConnectedEdges: false,
        },
        edges: {
            arrows: {
                to: {
                    enabled: false,
                }
            }

        },
        layout: {randomSeed: seed}, // just to make sure the layout is the same when the locale is changed
        locale: document.getElementById("locale").value,
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

        },

        groups: {
            useDefaultGroups: true,
            start: {backgroundColor: 'red'},
            end: {backgroundColor: 'green'},
        },
    };
    network = new vis.Network(container, data, options);
    //отслеживает выделенные узлы(макс 2 узла)
    network.on("selectNode", function (params) {
        addToRoute(params.nodes[0]);
    });

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

function init() {
    setDefaultLocale();
    draw();
}

//remove graph
document.getElementById("remove-graph").addEventListener(
    "click",
    (e) => {
        clearGraph();
    },
    false
);

function clearGraph() {
    var container = document.getElementById("mynetwork");
    // remove all nodes and edges
    nodes = new vis.DataSet([]);
    edges = new vis.DataSet([]);
    data = {
        nodes: nodes,
        edges: edges,
    };
    draw();
}

//change graph view(directed or undirected)
document.getElementById("isDirected").addEventListener("change", function () {
    if (this.checked) {
        let opt = {
            edges: {
                arrows: {
                    to: {
                        enabled: true,
                    }
                }
            }
        }
        //for test
        console.log("checked");
        network.setOptions(opt);
        network.redraw();
    } else if (!this.checked) {
        let opt = {
            edges: {
                arrows: {
                    to: {
                        enabled: false,
                    }
                }
            }
        }
        console.log("unchecked");
        network.setOptions(opt);
        network.redraw();
    }
});
//send query to azure func
document.getElementById("sendrequest").addEventListener("click", (e) => {
    async function postData(url = "", data = {}) {
        const response = await fetch(url, {
            method: "POST", // GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        console.log("response:");
        console.log(data);
        return await response.json();
    }

    //collect data nodes and edges
    // const nodePositions = JSON.stringify(data.nodes.map(({id, label, x, y}) => ({id, label, x, y})));
    // const edgeRoutes = data.edges.map(({from, to, label}) => ({from, to, label}));
    const request = {
        graph: {
            nodes: data.nodes.map(({id}) => ({id: id})),
            edges: data.edges.map(({from, to, label}) => ({
                from: String(from),
                to: String(to),
                weight: (label = 1),
            })),
            selectedNodes: network.getSelectedNodes(),
            directed: document.getElementById("isDirected").checked,
        },
    };

    postData("http://localhost:7071/api/FindShortestPath", request)
        .then(result => {
            //for test
            console.log(result);
            insertFindShortestPathResult(result);
        })
        .catch(error => console.log('error', error));
});

// insert into html
function insertFindShortestPathResult(data) {
    let innerDiv = document.querySelector(".shortest__path");
    innerDiv.textContent = "";
    let ul = document.createElement("ul");
    let idx = 0;
    for (let [id, length] of Object.entries(data.dist)) {
        console.log(id);
        let li = document.createElement("li");
        li.textContent =
            "Кратчайший путь из " +
            network.body.data.nodes.get(network.getSelectedNodes()[0]).label +
            " в " +
            network.body.data.nodes.get(id).label +
            " составляет " +
            (length === 2147483647 ? "недоступен" : length);
        ul.appendChild(li);
    }
    innerDiv.appendChild(ul);
}


//TODO: implement function which listen when node is selected
//
var routeFromTo = [];

// add node to arr
function addToRoute(node) {
    switch (routeFromTo.length) {
        case 0:
            routeFromTo.push(node);
            //mark as green
            break;
        case 1:
            node.group = 'end';
            routeFromTo.push(node);
            //mark as red
            break;
        default:
            routeFromTo.pop();
            routeFromTo.push(node);
        //mark as red

    }
    console.log(`Array route: ${routeFromTo}`);
}


