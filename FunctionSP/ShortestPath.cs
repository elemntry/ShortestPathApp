using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using ShortestPathAlgos;
using System.Collections.Generic;
using System.Linq;

namespace FunctionSP
{
    public static class ShortestPath
    {
        [FunctionName("FindShortestPath")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)]
            HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");
            //read stream and write into string 
            string request = await new StreamReader(req.Body).ReadToEndAsync();
            //check to right Json format and then get Json Object
            JsonDocument data = JsonDocument.Parse(request);
            JsonElement root = data.RootElement;
            log.LogInformation(root.ToString());
            //create graph

            List<Node> nodes = new List<Node>();
            foreach (var el in root.GetProperty("graph").GetProperty("nodes").EnumerateArray())
            {
                nodes.Add(new Node(el.GetProperty("id").GetString()));
            }

            //create edges
            List<Edge> edges = new List<Edge>();
            foreach (var el in root.GetProperty("graph").GetProperty("edges").EnumerateArray())
            {
                string from = el.GetProperty("from").GetString();
                string to = el.GetProperty("to").GetString();
                int weight = el.TryGetProperty("weight", out var weightJsonEl)
                    ? int.Parse(weightJsonEl.GetString())
                    : 1;

                edges.Add(new Edge(nodes[nodes.FindIndex(node => node.Payload == from)],
                    nodes[nodes.FindIndex(node => node.Payload == to)], weight));
            }

            var directed = root.GetProperty("graph").GetProperty("directed").GetBoolean();
            //create graph
            Graph graph = new Graph(nodes, edges, directed);

            //init node Start and End
            var isSelectedNodes = root.GetProperty("graph").TryGetProperty("selectedNodes", out var selectedNodesElems);
            var selectedNodes = selectedNodesElems.EnumerateArray().Select(el => el.GetString()).ToArray();
            var startNode = selectedNodes[0];
            var endNode = selectedNodes[1];
            //find shortest Path
            Dijkstra path = new Dijkstra(graph, graph.Nodes[graph.Nodes.FindIndex(node => node.Payload == startNode)]);
            path.FindShortestPath();
            //prepare to return object
            List<ResultNode> arrResultNodes = new List<ResultNode>();
            path.Graph.Nodes.ForEach(node => arrResultNodes.Add(new ResultNode(node.Payload,
                path.Dist[path.Graph.Nodes.IndexOf(node)], path.Prev[path.Graph.Nodes.IndexOf(node)]?.ToString())));
            ShortestPathResponce shortestPathResponce =
                new ShortestPathResponce(arrResultNodes, new[] {startNode, endNode});
            var responce = shortestPathResponce;
            //json graph spec
            //https://github.com/jsongraph/json-graph-specification
            //TODO return graph with prev short node and weight from short path
            var result = new ShortestPathAnswer(path.Dist, path.Prev);
            return new JsonResult(responce);
        }
    }

    class ShortestPathResponce
    {
        public List<ResultNode> ResultNodes { get; private set; }
        public string[] FromToNodesIds { get; private set; }

        public ShortestPathResponce(List<ResultNode> resultNodes, string[] fromToNodesIds)
        {
            ResultNodes = resultNodes;
            FromToNodesIds = fromToNodesIds;
        }
    }

    class ResultNode
    {
        public string Id { get; private set; }
        public int Dist { get; private set; }
        public string PrevNodeId { get; private set; }

        public ResultNode(string id, int dist, string prevNodeId)
        {
            Id = id;
            Dist = dist;
            PrevNodeId = prevNodeId;
        }
    }

    public class ShortestPathAnswer
    {
        public int[] Dist { get; private set; }
        public string[] Prev { get; private set; }

        public ShortestPathAnswer(int[] dist, Node[] prev)
        {
            Dist = dist;
            Prev = prev.Select(el => el?.ToString()).ToArray();
        }
    }
}