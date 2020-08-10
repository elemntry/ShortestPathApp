using System;
using System.Collections.Generic;
using System.Text;

namespace ShortestPathAlgos
{
    public class Graph
    {
        public bool Directed { get; private set; }
        public List<Edge> Edges { get; private set; }
        public List<Node> Nodes { get; private set; }        
    public Graph(List<Node> nodes, List<Edge> edges, bool directed)
        {
            Nodes = nodes;
            Edges = edges;
            Directed = directed;
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