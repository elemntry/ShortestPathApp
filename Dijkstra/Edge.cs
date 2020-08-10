using System;
using System.Collections.Generic;
using System.Text;

namespace ShortestPathAlgos
{
    public class Edge
    {
        public Node From { get; private set; }
        public Node To { get; private set; }
    public int Weight { get; private set; }

        public Edge(Node from, Node to, int weight = 1)
        {
            From = from;
            To = to;
            Weight = weight;            
        }

        public override string ToString()
        {
            return $"{From} -> {To}";
        }
    }
}
