var nodes = new vis.DataSet([
    {id: 1, label: "Node 1"},
    {id: 2, label: "Node 2"},
    {id: 3, label: "Node 3"},
    {id: 4, label: "Node 4"},
    {id: 5, label: "Node 5"}
]);

// create an array with edges
var edges = new vis.DataSet([
    {from: 1, to: 3},
    {from: 1, to: 2},
    {from: 2, to: 4},
    {from: 2, to: 5},
    {from: 3, to: 3}
]);

// create a network
var container = document.getElementById("mynetwork");
var data = {
    nodes: nodes,
    edges: edges
};
var options = {
    interaction: {
        selectConnectedEdges: false,
    },
    nodes:{
        color:{
            background:'#a0a0a0',
            highlight:'#6f6f6f'
        }
    },
    edges: {
        arrows: {
            to: {
                enabled: false,
            }
        }

    },
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
};

function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function editNode(data, cancelAction, callback) {
    document.getElementById('node-label').value = data.label;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelAction.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}

// Callback passed as parameter is ignored
function clearNodePopUp() {
    document.getElementById('node-saveButton').onclick = null;
    document.getElementById('node-cancelButton').onclick = null;
    document.getElementById('node-popUp').style.display = 'none';
}

function cancelNodeEdit(callback) {
    clearNodePopUp();
    callback(null);
}

function saveNodeData(data, callback) {
    data.label = document.getElementById('node-label').value;
    clearNodePopUp();
    callback(data);
}

function editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    document.getElementById('edge-label').value = data.label;
    document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(this, data, callback);
    document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(this, callback);
    document.getElementById('edge-popUp').style.display = 'block';
}

function clearEdgePopUp() {
    document.getElementById('edge-saveButton').onclick = null;
    document.getElementById('edge-cancelButton').onclick = null;
    document.getElementById('edge-popUp').style.display = 'none';
}

function cancelEdgeEdit(callback) {
    clearEdgePopUp();
    callback(null);
}

function saveEdgeData(data, callback) {
    if (typeof data.to === 'object')
        data.to = data.to.id
    if (typeof data.from === 'object')
        data.from = data.from.id
    data.label = document.getElementById('edge-label').value;
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
        //for test
        console.log("unchecked");
        network.setOptions(opt);
        network.redraw();
    }
});

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
    network = new vis.Network(container, data, options);
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
            routeFromTo.push(node);
            console.log(node);
            nodes.update([{id: node, color: {background: 'green', highlight:'green'}}]);
            //mark as green
            break;
        case 1:
            node.group = 'end';
            routeFromTo.push(node);
            nodes.update([{id: node, color: {background: 'red', highlight: 'red'}}]);
            //mark as red
            break;
        default:            
            nodes.update([{id: routeFromTo[1], color: {background:'#a0a0a0', highlight:'#6f6f6f'}}]);
            routeFromTo.pop();
            routeFromTo.push(node);
            nodes.update([{id: node, color: {background: 'red', highlight: 'red'}}]);
            //mark as red

    }
    // for test
    console.log(`Array route: ${routeFromTo}`);
}
//deselect route nodes. If click on blank place, nodes was deselected
network.on("click", function(params){
    
    if(params.nodes.length == 0 && params.edges.length == 0){
        nodes.update([{id: routeFromTo[0], color: {background:'#a0a0a0', highlight:'#6f6f6f'}}, {id: routeFromTo[1], color: {background:'#a0a0a0', highlight:'#6f6f6f'}}]);
        routeFromTo.length = 0;
    }
});
