//create an array with nodes
var nodes = new vis.DataSet([
  { id: "1", label: "Node 1" },
  { id: 2, label: "Node 2" },
  { id: 3, label: "Node 3" },
  { id: 4, label: "Node 4" },
  { id: 5, label: "Node 5" },
]);

// create an array with edges
var edges = new vis.DataSet([
  { from: "1", to: 3 },
  { from: "1", to: 2 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 3, to: 3 },
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
        color: { background: bg, highlight: hlBg },
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
  (e) => {
    clearGraph();
    checkAllRouteNodesCheck();
    let nodeSpan = document.querySelectorAll(".path-info__node");
    nodeSpan.forEach((el) => (el.textContent = ""));
  },
  false
);

function clearGraph() {
  // remove all nodes and edges
  nodes.forEach((node) => nodes.remove(nodes.get(node)));
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
          color: { background: startNodeBg, highlight: startNodeHlBg },
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
          color: { background: bg, highlight: hlBg },
        },
        {
          id: routeFromTo[0],
          color: { background: startNodeBg, highlight: startNodeHlBg },
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
  let fromNodeSpan = document.querySelector(".path-info__node_from");
  let toNodeSpan = document.querySelector(".path-info__node_to");
  if (params.nodes.length === 0 && params.edges.length === 0) {
    nodes.forEach((node) => {
      nodes.update([
        {
          id: node.id,
          color: { background: bg, highlight: hlBg },
        },
      ]);
      routeFromTo.length = 0;
      fromNodeSpan.textContent = toNodeSpan.textContent = "";
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
  if (routeFromTo.length === 2) {
    document.getElementById("sendrequest").disabled = false;
  } else {
    document.getElementById("sendrequest").disabled = true;
  }
}
document.addEventListener("click", (e) => checkAllRouteNodesCheck());
