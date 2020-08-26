using System.Collections.Generic;
using System.Linq;

namespace ShortestPathAlgos
{
    public class Node
    {
        public string Payload { get; private set; }
        public Graph Graph { get; internal set; }
        public Node(string payload)
        {
            Payload = payload;
        }

        public List<Edge> InboundEdges
        {
            get { return Graph.Edges.Where(e => e.To == this).ToList(); }
        }

        public List<Edge> OutboundEdges
        {
            get { return Graph.Edges.Where(e => e.From == this).ToList(); }
        }
        public override string ToString()
        {
            return Payload;
        }
    }
}
