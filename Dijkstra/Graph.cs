using System;
using System.Collections.Generic;
using System.Text;

namespace Dijkstra
{
    class Graph
    {
        public List<Edge> Edges { get; private set; }
        public List<Node> Nodes { get; private set; }

        public Graph(List<Node> nodes, List<Edge> edges)
        {
            Nodes = nodes;
            Edges = edges;
            foreach (var node in nodes)
            {
                node.Graph = this;
            }
        }

        public void AddEdge(Edge edge)
        {
            Edges.Add(edge);
        }

        public void AddEdge(Node from, Node to, int weight)
        {
            Edges.Add(new Edge(from, to, weight));
        }

        public void AddNode(Node node)
        {
            Nodes.Add(node);
            node.Graph = this;
        }

        public void RemoveEdge(Edge edge)
        {
            Edges.Remove(edge);
        }

        public void RemoveNode(Node node)
        {
            Edges.RemoveAll(e => e.From == node || e.To == node);
            Nodes.Remove(node);
        }
    }
}
